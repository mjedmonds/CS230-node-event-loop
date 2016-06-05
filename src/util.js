/*jshint esversion: 6 */

const fs = require('fs');
const readline = require('readline');
const esformatter = require('esformatter');
const events = require('events');

var file_emitter = new events.EventEmitter();

var esformatter_opts = fs.readFileSync('../esformatter_options.json');
esformatter_opts = JSON.parse(esformatter_opts);

//register esformatter-braces manually so we don't need a config
esformatter.register(require('esformatter-braces'));

module.exports = {
  file_emitter: file_emitter,
  // compares two loc objects
  compare_loc: function (loc_a, loc_b)
  {
    var a_line = Number(loc_a.line);
    var b_line = Number(loc_b.line);
    if (a_line < b_line)
    {
      return -1;
    }
    else if (a_line > b_line)
    {
      return 1;
    }
    else
    { // lines are equal, comapre columns
      var a_col = Number(loc_a.column);
      var b_col = Number(loc_b.column);
      if (a_col < b_col)
      {
        return -1;
      }
      else if (a_col > b_col)
      {
        return 1;
      }
      else
      {
        return 0;
      }
    }
  },

  append_filename: function (filename, append)
  {
    return append_filename(filename, append);
  },

  // this ensures the every loop/conditional has braces surrounding it (needed for AST to parse BlockStatements)
  format_file: function (filename)
  {
    var src = fs.readFileSync(filename).toString();
    src = esformatter.format(src, esformatter_opts);
    fs.writeFileSync(append_filename(filename, '_formatted'), src);
    src = fs.readFileSync(append_filename(filename, '_formatted'));
    return src;
  },

  fetch_target_files: function (search_filename)
  {
    var instream = fs.createReadStream(search_filename);
    var outstream = new (require('stream'))(); // won't use this, just need to push lines into an array
    var rl = readline.createInterface(instream, outstream);
    var file_arr = [];
    var dir_arr = [];
    var extension = '.js$';

    rl.on('line', function (line)
    {
      var re = new RegExp(extension);
      if (!re.test(line))
      { // directory specified
        dir_arr.push(line);
      } // 'line' contains the current line without the trailing newline character.
      if (re.test(line))
      { // javascript file specified
        file_arr.push(line);
      }
      //console.log(array);
    });

    rl.on('close', function ()
    {
      //console.log(dir_arr);
      //console.log(file_arr);
      var files = get_files_from_folder(dir_arr[0]);

      var js_files = (function (pattern)
      {
        var filtered = [],
          i = files.length,
          re = new RegExp(pattern);
        while (i--)
        {
          if (re.test(files[i]))
          {
            filtered.push(files[i]);
          }
        }
        return filtered;
      })(extension);

      file_arr = file_arr.concat(js_files);
      //console.log(file_arr);
      file_emitter.emit('filearrloaded', file_arr);
    });

  }
};

function append_filename(filename, append)
{
  return filename.substr(0, filename.lastIndexOf('.')) + append + filename.substr(filename.lastIndexOf('.'), filename.length);
}

function get_files_from_folder(dir)
{
  var results = [];

  fs.readdirSync(dir).forEach(function (file)
  {
    file = dir + '/' + file;
    var stat = fs.statSync(file);

    if (stat && stat.isDirectory())
    {
      results = results.concat(get_files_from_folder(file));
    }
    else
    {
      results.push(file);
    }

  });
  return results;
}
