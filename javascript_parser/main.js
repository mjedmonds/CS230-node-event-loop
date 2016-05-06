var fs = require('fs');
var esprima = require('esprima');
var walkAST = require('esprima-walk');

var emitNodes = []
var emitNodeCallingFunctions = []
var emitEvents = []
var unknownCount = 0


function hasOwnProperty(obj, prop) {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) &&
    (!(prop in proto) || proto[prop] !== obj[prop]);
}

// var findFunction = function(ast_node){
//   if (ast_node.type == "FunctionDeclaration"){
//     console.log("Found function named \"" + ast_node.id.name + "\"");
//   }
// }
//
// var findEmit = function(ast_node){
//   for (var prop in ast_node){
//     if (ast_node.hasOwnProperty(prop)) {
//       // console.log(prop + " " + ast_node[prop]);
//
//       // handle function declarations
//       if (prop == "type" && ast_node[prop] == "FunctionDeclaration"){
//         console.log("Found function: " + ast_node["id"]["name"]);
//       }
//
//       // handle function expressions
//       if (prop == "type" && ast_node[prop] == "FunctionExpression"){
//         console.log("Found function expression");
//       }
//
//       // follow body statements
//       if(prop == "body" || prop == "ExpressionStatement"){
//         findEmit(ast_node[prop]);
//       }
//
//       // follow variable declarations
//       if(prop == "type" && ast_node[prop] == "‌VariableDeclaration"){
//         for(var declaration in ast_node["declarations"]){
//           findEmit(declaration)
//         }
//       }
//     }
//   }
// }


function find_emit(parent){
  if(parent.type == "CallExpression"){
    emitEvents.push(parent.arguments[0].value);
  } else {
    find_emit(parent.parent);
  }
}

function collect_emitting_nodes(node) {
  //types.push(node.type)
  //nodesWithTypes.push(node)
  if (node.type == "Identifier" && node.hasOwnProperty("name") && node.name == "emit") {
    emitNodes.push(node);
    find_emit(node.parent)
  }
}

function find_function_name(parent){
  if(parent == null){
    emitNodeCallingFunctions.push("anon" + unknownCount);
    //console.log("pushing function name: anon" + unknownCount);
    unknownCount += 1
  } else if(parent.id == null) {
    //  console.log("found null parent.id, parent.type: " + parent.type);
    find_function_name(parent.parent);
  } else {
   // console.log("pushing function name: " + parent.id.name)
    emitNodeCallingFunctions.push(parent.id.name)
  }
}

function find_calling_function(node) {
  var parent = node.parent;
  // if(node.type == "Program"){
  //   console.log("At program");
  // }
  if(parent.hasOwnProperty("type") && (parent.type == "FunctionExpression" || parent.type == "FunctionDeclaration" || parent.type == "ArrowFunctionExpression")){
    //console.log("found function for emit");
    find_function_name(parent);
  }
  else{
    find_calling_function(parent);
  }
}

function print_emits(){
  for(i = 0; i < emitNodeCallingFunctions.length; i++) {
    console.log(emitNodeCallingFunctions[i] + " emitting event " + emitEvents[i]);
  }
}

function main() {
  var file = 'function-cases.js'
  var src = fs.readFileSync(file);

  var ast = esprima.parse(src, {
    loc: false
  });

  walkAST.walkAddParent(ast, collect_emitting_nodes);

  for (i = 0; i < emitNodes.length; i++) {
    find_calling_function(emitNodes[i]);
  }

  if (emitEvents.length != emitNodeCallingFunctions.length || emitEvents.length != emitNodes.length) {
    throw "Error: number of emit events, emit calling functions, and emit nodes should be the same length";
  }

  print_emits();
}

main()

console.log(JSON.stringify(ast))

