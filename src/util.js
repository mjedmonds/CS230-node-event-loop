/*jshint esversion: 6 */

const fs = require('fs');
const readline = require('readline');
const esformatter = require('esformatter');
const fs_extra = require('fs-extra');
const mkdirp = require('mkdirp');

var esformatter_opts = fs.readFileSync('../esformatter_options.json');
esformatter_opts = JSON.parse(esformatter_opts);

//register esformatter-braces manually so we don't need a config
esformatter.register(require('esformatter-braces'));

module.exports = {
  // compares two loc objects
  compare_loc: function(loc_a, loc_b) {
    var a_line = Number(loc_a.line);
    var b_line = Number(loc_b.line);
    if (a_line < b_line) {
      return -1;
    } else if (a_line > b_line) {
      return 1;
    } else { // lines are equal, comapre columns
      var a_col = Number(loc_a.column);
      var b_col = Number(loc_b.column);
      if (a_col < b_col) {
        return -1;
      } else if (a_col > b_col) {
        return 1;
      } else {
        return 0;
      }
    }
  },

  append_filename: function(filename, append) {
    return append_filename(filename, append);
  },

  // this ensures the every loop/conditional has braces surrounding it (needed for AST to parse BlockStatements)
  format_file: function(filename) {
    try {
      var src = fs.readFileSync(filename).toString();
      src = esformatter.format(src, esformatter_opts);
      fs.writeFileSync(filename, src);
      src = fs.readFileSync(filename);
      return src;
    } catch (err){
      console.error('Formatting file error: \'' + err + '\' in ' + filename);
    }
  },

  process_targets: function(search_filename) {
    var file_arr = fs.readFileSync(search_filename).toString().split('\n');
    var dir_arr = [];
    var extension = '.js$';
    var line, lumberjack_proj_name;

    for(var i = 0; i < file_arr.length; i++) {
      line = file_arr[i];
      if(!(/\S/).test(line)){
        // skip whitespace only lines
        continue;
      }
      if (line[line.length - 1] == '/') { // remove last slash if it is the last character
        line = line.substr(0, line.length - 1);
      }
      var base_path = line.substr(0, line.lastIndexOf('/')) + '/';
      var proj_name = line.substr(line.lastIndexOf('/') + 1, line.length);
      lumberjack_proj_name = proj_name + '_lumberjack'
      var proj_dup_path = base_path + lumberjack_proj_name;
      mkdirp(proj_dup_path, function(err) {
        if (err) {
          console.error(err);
        }
      });
      fs_extra.copySync(line, proj_dup_path);

      dir_arr.push(proj_dup_path);
    }

    //console.log(dir_arr);
    //console.log(file_arr);
    var files = get_files_from_folder(dir_arr[0]);

    var js_files = (function(pattern) {
      var filtered = [],
        i = files.length,
        re = new RegExp(pattern);
      while (i--) {
        if (re.test(files[i])) {
          filtered.push(files[i]);
        }
      }
      return filtered;
    })(extension);

    //file_arr = file_arr.concat(js_files);
    //console.log(file_arr);
    return [js_files, lumberjack_proj_name];


  }
};

function append_filename(filename, append) {
  return filename.substr(0, filename.lastIndexOf('.')) + append + filename.substr(filename.lastIndexOf('.'), filename.length);
}

function get_files_from_folder(dir) {
  var results = [];

  fs.readdirSync(dir).forEach(function(file) {
    file = dir + '/' + file;
    var stat = fs.statSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(get_files_from_folder(file));
    } else {
      results.push(file);
    }

  });
  return results;
}
