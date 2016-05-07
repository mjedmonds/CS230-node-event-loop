var fs = require('fs');
var esprima = require('esprima');
var walkAST = require('esprima-walk');

var emits = [];
var unknownCount = 0;

// Emit class, represents and emit and a corresponding caller
function Emit(event, caller) {
  this.event = event;     // event being triggered
  this.caller = caller;   // fucntion triggering event
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
    return parent.arguments[0].value;
  } else {
    return find_emit_event(parent.parent);
  }
}

// collects emitting node information (event and caller)
function collect_emitting_nodes(node) {
  //types.push(node.type)
  //nodesWithTypes.push(node)
  if (node.type == "Identifier" && node.hasOwnProperty("name") && node.name == "emit") {
    emits.push(new Emit(find_emit_event(node.parent), find_calling_function(node.parent)));
  }
}

// finds the function name of a calling function
function find_function_name(parent) {
  if (parent == null) {
    //console.log("found function name: anon" + unknownCount);
    return "anon" + unknownCount++;
  } else if (parent.id == null) {
    //  console.log("found null parent.id, parent.type: " + parent.type);
    return find_function_name(parent.parent);
  } else {
    //console.log("found function name: " + parent.id.name)
    return parent.id.name;
  }
}

// finds the calling function of this AST node
function find_calling_function(node) {
  var parent = node.parent;

  if (parent.hasOwnProperty("type")
    && (parent.type == "FunctionExpression"
    || parent.type == "FunctionDeclaration"
    || parent.type == "ArrowFunctionExpression")) {
    //console.log("found function for emit");
    return find_function_name(parent);
  } else {
    return find_calling_function(parent);
  }
}

function print_emits() {
  for (i = 0; i < emits.length; i++) {
    console.log(emits[i].caller + " emitting event " + emits[i].event);
  }
}

function main() {
  var file = 'function-cases.js'
  var src = fs.readFileSync(file);

  var ast = esprima.parse(src, {
    loc: false
  });

  walkAST.walkAddParent(ast, collect_emitting_nodes);

  print_emits();

  console.log(JSON.stringify(ast))
}

main()
