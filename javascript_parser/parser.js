var fs = require('fs');
var esprima = require('esprima');

var file = 'functions.js'
var src = fs.readFileSync(file);

var parse = esprima.parse(src, {
  loc: true
});
console.log(JSON.stringify(parse));
