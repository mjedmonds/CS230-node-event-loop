const fs = require('fs');
const esformatter = require('esformatter');

const insertor = require('./insertion');
const ast_parser =  require('./ast_parser');
const util = require('./util');

//register esformatter-braces manually so we don't need a config
esformatter.register(require('esformatter-braces'));

// this ensures the every loop/conditional has braces surrounding it (needed for AST to parse BlockStatements)
function format_file(filename, esformatter_opts)
{
  var src = fs.readFileSync(filename).toString();
  src = esformatter.format(src, esformatter_opts);
  fs.writeFileSync(util.append_filename(filename, '_formatted'), src);
  src = fs.readFileSync(util.append_filename(filename, '_formatted'));
  return src;
}

function main()
{
  var filename = '../test/function-cases.js';
  var esformatter_opts = fs.readFileSync('../esformatter_options.json');
  esformatter_opts = JSON.parse(esformatter_opts);

  // read the file, format it to have braces (to insure BlockStatement wrapping, write it, load the formatted version
  var src = format_file(filename, esformatter_opts);

  var logs = ast_parser.collect_loggings(src, filename);

  insertor.insert(util.append_filename(filename, '_formatted'), logs);
}

main()
