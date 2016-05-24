const fs = require('fs');
const esprima = require('esprima');
const walkAST = require('esprima-walk');

var file = 'function-cases.js'
var emits = [];
var listeners = [];
var unknownCount = 0;

function SourceInfo(filename, loc) {
  this.filename = filename;
  this.loc = loc;
}

// Emit class, represents and emit and a corresponding caller
//function Emit(event, caller, emit_src_info, caller_src_info) {
function Emit(event, caller, emit_src, caller_src) {
  this.event = event; // event being triggered
  this.emit_src = emit_src; // info on where the emit is located in source
  this.caller = caller; // fucntion triggering event
  this.caller_src = caller_src; // info on where the caller is located in source
}

// Listener class, represents an event and a corresponding callback
// XXX: callback_name_src is the same line number as the on()/once(). It should be the line up of the actual callback function
function Listener(event, callback_name, once, event_src, callback_name_src) {
  this.event = event;
  this.callback_name = callback_name;
  this.once = once;
  this.event_src = event_src;
  this.callback_src = callback_name_src;
}

function hasOwnProperty(obj, prop) {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) &&
    (!(prop in proto) || proto[prop] !== obj[prop]);
}

// finds an the event emitting by an emit() node in the AST
function find_emit_event(parent) {
  if (parent.type == "CallExpression") {
    //console.log("found event: " + parent.arguments[0].value);
    return [parent.arguments[0].value, parent.loc.start];
  } else {
    return find_emit_event(parent.parent);
  }
}

// finds the function name of a calling function
function find_function_name(parent, child) {
  if (parent == null) {
    // console.log("found function name: anon" + unknownCount);
    return ["anon" + unknownCount++, child.loc.start];
  } else if (parent.id == null) {
    // console.log("found null parent.id, parent.type: " + parent.type);
    return find_function_name(parent.parent, parent);
  } else {
    // console.log("found function name: " + parent.id.name)
    return [parent.id.name, parent.loc.start];
  }
}

// finds the calling function of this AST node
function find_calling_function(node) {
  // global emit will not have a parent, "Program" is the parent in the AST
  if (!node.hasOwnProperty("parent")) {
    return "Program";
  }

  var parent = node.parent;

  if (parent.hasOwnProperty("type") && (parent.type == "FunctionExpression" || parent.type == "FunctionDeclaration" || parent.type == "ArrowFunctionExpression")) {
    //console.log("found function for emit");
    return find_function_name(parent, node);
  } else {
    return find_calling_function(parent);
  }
}

// collects emitting node information (event and caller)
function collect_emits(node) {
  //types.push(node.type)
  //nodesWithTypes.push(node)
  if (node.type == "Identifier" && node.hasOwnProperty("name") && node.name == "emit") {
    emit_ret = find_emit_event(node.parent);            // emit_ret[0] = event name, emit_ret[1] = loc of emit()
    calling_func = find_calling_function(node.parent);  // calling_func[0] = name of calling func, calling_func[1] = loc of calling function
    emits.push(new Emit(emit_ret[0], calling_func[0], new SourceInfo(file, emit_ret[1]), new SourceInfo(file, calling_func[1])));
    return true;
  } else {
    return false;
  }
}

function find_callback_function(callback) {
  if (callback.name != null) {
    return [callback.name, callback.loc.start];
  } else {
    return ["anon" + unknownCount++, callback.body.loc.start];
  }
}

function collect_listeners(node) {
  if (node.type == "ExpressionStatement" && node.expression.type == "CallExpression" && node.expression.arguments.length == 2) {
    if (node.expression.callee.property.name == "on"){
      once = false;
    } else if (node.expression.callee.property.name == "once"){
      once = true;
    } else { // return if this isn't an on() or once()
      return
    }
    //console.log("found on()");
    event = node.expression.arguments[0];
    callback_func = find_callback_function(node.expression.arguments[1]);
    listeners.push(new Listener(event.value, callback_func[0], once, new SourceInfo(file, event.loc.start), new SourceInfo(file, callback_func[1])));
  }
}

function ast_walker(node) {
  var emit_found = collect_emits(node);
  // only look for listeners if we didn't find an emit, no reason to look for listeners if we found an emit
  if (!emit_found) {
    collect_listeners(node);
  }
  // console.log(node.type)
}

function print_emits() {
  for (i = 0; i < emits.length; i++) {
    console.log(emits[i].caller + " emitting event " + emits[i].event);
  }
}

function print_listeners() {
  for (i = 0; i < listeners.length; i++) {
    console.log(listeners[i].event + " triggers callback " + listeners[i].callback_name + "; once: " + listeners[i].once);
  }
}

function main() {
  var src = fs.readFileSync(file);

  var ast = esprima.parse(src, {
    loc: true
  });

  walkAST.walkAddParent(ast, ast_walker);

  //print_emits();
  print_listeners();


  //console.log(JSON.stringify(ast))
}

main()
