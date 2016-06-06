/*jshint esversion: 6 */

Error.stackTraceLimit = Infinity;

const inserter = require('./inserter');
const ast_parser = require('./ast_parser');
const lumberjack_util = require('./util');

function main() {
  var target_filename = '../targets.txt';

  try {
    var target_ret = lumberjack_util.process_targets(target_filename);
    var targets = target_ret[0];
    var proj_name = target_ret[1];

    //console.log(file_arr);
    var log_collection, src;
    for (var i = 0; i < targets.length; i++) {
      src = undefined;
      log_collection = undefined;
      // read the file, format it to have braces (to insure BlockStatement wrapping, write it, load the formatted version
      try {
        src = lumberjack_util.format_file(targets[i]);
      } catch (err){
        console.error(err);
        continue;
      }

      // parse AST of this file
      try {
        log_collection = ast_parser.collect_logs(src, targets[i]);
      } catch (err) {
        console.error('AST parsing error: \'' + err + '\' in ' + targets[i]);
        continue;
      }

      // insert the logs into the files
      try {
        if (log_collection !== undefined && log_collection.length !== 0) { // insert if we found anything worth logging
          inserter.insert(targets[i], log_collection, proj_name);
        }
      } catch (err) {
        console.error('lumberjack log insertion error: \'' + err + '\'');
      }
    }
  } catch (err) {
    // any other error, fail
    console.error(err);
    return -1;
  }
}

main();
