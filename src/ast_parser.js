const fs = require('fs');
const esprima = require('esprima');
const walkAST = require('esprima-walk');
const util = require('./util');

// array that represents the nessecary calls to bunyan to enable logging
// Note: between positions 2 and 3 (name) and 4 and 5 (path), the filename should be inserted
// this will be inserted after the last require() call in the source. If no require is found, insert at the beginning
const bunyan_insert_arr = [
  'const bunyan = require(\'bunyan\');',
  'var log = bunyan.createLogger({',
  'name: \'',
  '\',',
  'streams: [ {level: \'info\', path: \'',
  '\'}]',
  '});'
];

var emits = [];
var listeners = [];
var unknown_count = 0;
var filename;

/* ---- CLASSES ---- */



// Emit class, represents and emit and a corresponding caller
//function Emit(event, caller, emit_src_info, caller_src_info) {
function Emit(event, caller, emit_loc, caller_loc, blk_stmt_loc, filename)
{
  this.event = event; // event being triggered
  this.caller = caller; //
  this.emit_loc = emit_loc; // loc of emit
  this.caller_loc = caller_loc; // loc of caller's beginning
  this.blk_stmt_loc = blk_stmt_loc; // loc of event's block statement ending
  this.filename = filename;
}

// Listener class, represents an event and a corresponding callback
// XXX: callback_name_src is the same line number as the on()/once(). It should be the line up of the actual callback function?
function Listener(event, callback, once, listener_loc, filename)
{
  this.event = event;
  this.callback = callback;
  this.once = once;
  this.listener_loc = listener_loc; // loc of listener
  this.filename = filename;
}

// e_loc can be an emit or event loc
function LogItem(e_loc, blk_loc, log_str, filename)
{
  this.e_loc = e_loc;
  this.blk_loc = blk_loc;
  this.log_str = log_str;
  this.filename = filename;
}

/* ---------------------------------------------------------------- */

module.exports = {
  collect_loggings: function collect_loggings(src, fname)
  {
    // clear previous file's data
    emits = [];
    listeners = [];
    unknown_count = 0;
    filename = fname;
    
    var ast = esprima.parse(src, {
      loc: true
    });

    walkAST.walkAddParent(ast, ast_walker);

    var listener_logs = log_listeners();
    var emit_logs = log_emits();
    var logs = emit_logs.concat(listener_logs)
    logs.sort(compare_logs); // sort the logs by e_loc's
    return logs;
  }
}

// finds an the event emitting by an emit() node in the AST
function find_emit_event_name(parent)
{
  if (parent.type == "CallExpression")
  {
    //console.log("found event: " + parent.arguments[0].value);
    return [parent.arguments[0].value, parent.loc];
  }
  else
  {
    return find_emit_event_name(parent.parent);
  }
}

// finds the function name of a calling function
function find_function_name(parent, child)
{
  if (parent == null)
  { // anonymous function case
    // console.log("found function name: anon" + unknown_count);
    return ['anon' + unknown_count++, child.loc];
  }
  else if (parent.type == 'Property' && parent.hasOwnProperty('key') && parent.key.hasOwnProperty('name'))
  { // handle special case of anonymous function that is a value in key/value pair
    return [parent.key.name, parent.key.loc];
  }
  else if (!parent.id)
  { // otherwise if parent is null, recurse down parent looking for the function
    // console.log("found null parent.id, parent.type: " + parent.type);
    return find_function_name(parent.parent, parent);
  }
  else
  {
    // console.log("found function name: " + parent.id.name)
    return [parent.id.name, parent.loc];
  }
}

// finds the calling function of this AST node
function find_calling_function(node)
{
  // global emit will not have a parent, "Program" is the parent in the AST
  if (!node.hasOwnProperty("parent"))
  { // if the node doesn't have a parent, we are at the end of the AST
    return "Program";
  }

  var parent = node.parent;

  if (parent.hasOwnProperty("type") && (parent.type == "FunctionExpression" || parent.type == "FunctionDeclaration" || parent.type == "ArrowFunctionExpression"))
  { // if we find a function, look for its name
    //console.log("found function for emit");
    return find_function_name(parent, node);
  }
  else
  { // otherwise recurse up the parent
    return find_calling_function(parent);
  }
}

// returns the end loc of the next enclosing block statement
function find_enclosing_blk_stmt(node)
{
  if (node.hasOwnProperty('type') && node.type == 'BlockStatement')
  {
    return node.loc;
  }
  else if (node.type == 'Program')
  { // if we are at the root of the AST, don't recurse
    return null;
  }
  else
  { // recurse down the parent
    return find_enclosing_blk_stmt(node.parent);
  }
}

// collects emitting node information (event and caller) and registers them into the emits global var
function collect_emits(node)
{
  if (node.type == "Identifier" && node.hasOwnProperty("name") && node.name == "emit")
  { // found an emit
    var emit_ret = find_emit_event_name(node.parent);            // emit_ret[0] = event name, emit_ret[1] = loc of emit()
    var calling_func = find_calling_function(node.parent);  // calling_func[0] = name of calling func, calling_func[1] = loc of calling function
    var blk_stmt_loc = find_enclosing_blk_stmt(node.parent);
    var emit_loc = emit_ret[1];
    var calling_func_loc = calling_func[1];
    
    emits.push(new Emit(emit_ret[0], calling_func[0], emit_loc, calling_func_loc, blk_stmt_loc, filename));
    return true;
  }
  else
  { // didn't find an emit
    return false;
  }
}

// returns the function name of a callback (or anon if unknown)
function find_callback_function(callback)
{
  if (callback.name != null)
  {
    return [callback.name, callback.loc];
  }
  else
  {
    return ["anon" + unknown_count++, callback.body.loc];
  }
}

// finds all on() and once() calls and registers them into the listeners var
function collect_listeners(node)
{
  if (node.type == "ExpressionStatement" && node.expression.type == "CallExpression" && node.expression.arguments.length == 2)
  {
    var once;
    if (node.expression.callee.property.name == "on")
    {
      once = false;
    }
    else if (node.expression.callee.property.name == "once")
    {
      once = true;
    }
    else
    { // return if this isn't an on() or once()
      return;
    }
    //console.log("found on()");
    var event = node.expression.arguments[0];
    var callback_func = find_callback_function(node.expression.arguments[1]);
    var calling_func_loc = callback_func[1];
    listeners.push(new Listener(event.value, callback_func[0], once, event.loc, calling_func_loc, filename));
  }
}

// main walking function to traverse each AST node
function ast_walker(node)
{
  var emit_found = collect_emits(node);
  // only look for listeners if we didn't find an emit, no reason to look for listeners if we found an emit
  if (!emit_found)
  {
    collect_listeners(node);
  }
  // console.log(node.type)
}

// compares two LogItems by looking at their e_loc's, used to sort array of log inserts
function compare_logs(log_a, log_b)
{
  return util.compare_loc(log_a.e_loc.start, log_b.e_loc.start);
}

function print_emits()
{
  for (var i = 0; i < emits.length; i++)
  {
    console.log(emits[i].caller + " emitting event " + emits[i].event);
  }
}

function print_listeners()
{
  for (var i = 0; i < listeners.length; i++)
  {
    if (listeners[i].once)
    {
      console.log(listeners[i].event + " triggers callback " + listeners[i].callback + " once");
    }
    else
    {
      console.log(listeners[i].event + " triggers callback " + listeners[i].callback);
    }
  }
}

function log_emits()
{
  var emit_logs = [];
  for (var i = 0; i < emits.length; i++)
  {
    emit_logs.push(new LogItem(emits[i].emit_loc, emits[i].blk_stmt_loc,
      'log.info(\'' + emits[i].caller + ' emitting event ' + emits[i].event + '\')', emits[i].filename));
  }
  return emit_logs;
}

function log_listeners()
{
  var listener_logs = [];
  for (var i = 0; i < listeners.length; i++)
  {
    if (listeners[i].once)
    {
      listener_logs.push(new LogItem(listeners[i].listener_loc, listeners[i].blk_stmt_loc,
        'log.info(\'' + listeners[i].event + ' triggers callback ' + listeners[i].callback + ' once' + '\')',
        listeners[i].filename));
    }
    else
    {
      listener_logs.push(new LogItem(listeners[i].listener_loc, listeners[i].blk_stmt_loc,
        'log.info(\'' + listeners[i].event + ' triggers callback ' + listeners[i].callback + ' once' + '\')',
        listeners[i].filename));
    }
  }
  return listener_logs;
}