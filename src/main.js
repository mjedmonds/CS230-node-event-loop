/*jshint esversion: 6 */

const inserter = require('./inserter');
const ast_parser =  require('./ast_parser');
const util = require('./util');

function main()
{
  var filename = '../test/function-cases.js';

  // read the file, format it to have braces (to insure BlockStatement wrapping, write it, load the formatted version
  var src = util.format_file(filename);

  var log_collection = ast_parser.collect_loggings(src, filename);

  inserter.insert(util.append_filename(filename, '_formatted'), log_collection);

}

main();
