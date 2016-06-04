/*jshint esversion: 6 */

const fs = require('fs');
const esformatter = require('esformatter');

var esformatter_opts = fs.readFileSync('../esformatter_options.json');
esformatter_opts = JSON.parse(esformatter_opts);

//register esformatter-braces manually so we don't need a config
esformatter.register(require('esformatter-braces'));

module.exports = {
// compares two loc objects
  compare_loc: function compare_loc(loc_a, loc_b)
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
  }

};

function append_filename(filename, append)
{
  return filename.substr(0, filename.lastIndexOf('.')) + append + filename.substr(filename.lastIndexOf('.'), filename.length);
}
