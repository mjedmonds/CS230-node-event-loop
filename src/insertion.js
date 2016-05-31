// const readline = require('readline');
const fs = require('fs');
var LineByLineReader = require('line-by-line');


module.exports = {
  insert: function insert(file, insert_tuple)
  {
    var lr = new LineByLineReader(file);
    var file_arr = []; // array that represents a file

    lr.on('line', function (line)
    {
      file_arr.push(line); // 'line' contains the current line without the trailing newline character.
      //console.log(file_arr);
    });

    // once we're done reading the file, insert the tuples and write
    lr.on('end', function ()
    {
      file_arr = insert_tuples(file_arr, insert_tuple);// All lines are read, file is closed now.
      console.log(file_arr);
      var out_file = file.substr(0, file.lastIndexOf('.')) + '_mod' + file.substr(file.lastIndexOf('.'), file.length);
      write_file_arr(file_arr, out_file);
    });
  }
}

function insert_tuples(file_arr, insert_tuple)
{
  while (insert_tuple.length)
  {
    // the -2 is account for 1) line indexing starts at 1, but array indexing starts at 0 and 2) want to insert log before emit
    file_arr.splice(insert_tuple[insert_tuple.length - 1][0], 0, insert_tuple[insert_tuple.length - 1][1])
    insert_tuple.pop();
  }
  return file_arr;
}

function write_file_arr(file_arr, filename)
{
  var file = fs.createWriteStream(filename);
  file.on('error', function (err)
  { /* error handling */
    console.log(err);
  });

  // write to file
  file_arr.forEach(function (v)
  {
    file.write(v + '\n');
  });

  file.end();
}

//console.log(insert(file_str, insert_tuple));

