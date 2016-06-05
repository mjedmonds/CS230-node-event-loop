/*jshint esversion: 6 */


const inserter = require('./inserter');
const ast_parser = require('./ast_parser');
const util = require('./util');

function main() {
  var target_filename = '../targets.txt';

  util.process_targets(target_filename);

  // once the file_arr has been populated by fetch_target_files, process each file
  util.file_emitter.on('filearrloaded', function(file_arr) {
    //console.log(file_arr);
    for (var i = 0; i < file_arr.length; i++) {
      // read the file, format it to have braces (to insure BlockStatement wrapping, write it, load the formatted version
      var src = util.format_file(file_arr[i]);

      var log_collection = ast_parser.collect_loggings(src, file_arr[i]);

      if (log_collection.length !== 0) { // insert if we found anything worth logging
        inserter.insert(file_arr[i], log_collection);
      }
    }
  });

}

main();
