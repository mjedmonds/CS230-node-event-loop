/*jshint esversion: 6 */

// const readline = require('readline');
const fs = require('fs');
const readline = require('readline');
const util = require('./util');

// array that represents the nessecary calls to bunyan to enable logging
// Note: between positions 2 and 3 (name) and 4 and 5 (path), the filename should be inserted
// this will be inserted after the last require() call in the source. If no require is found, insert at the beginning
const const_lumberjack_header_arr = [
  'const bunyan = require(\'bunyan\');',
  'var lumberjack = bunyan.createLogger({ name: \'',
  '\', streams: [ {level: \'info\', path: \'',
  '\'}]});'
];

module.exports = {
  // parameters
  insert: function (filename, log_collection)
  {
    var instream = fs.createReadStream(filename);
    var outstream = new (require('stream'))(); // won't use this, just need to push lines into an array
    var rl = readline.createInterface(instream, outstream);
    var file_arr = [];
    var outfile = util.append_filename(filename, '_mod');
    var lumberjack_header_arr = gen_lumberjack_header(outfile);


    rl.on('line', function (line)
    {
      file_arr.push(line); // 'line' contains the current line without the trailing newline character.
    });

    // once we're done reading the file, insert the tuples and write
    rl.on('close', function ()
    {
      //console.log(file_arr);
      file_arr = insert_log_collection(file_arr, log_collection);
      //console.log(file_arr);
      file_arr = insert_arr_in_file_arr(file_arr, lumberjack_header_arr, 0);
      write_format_file_arr(file_arr, outfile);
    });
  }
};

// log_items should be a sorted list of lines to insert
function insert_log_collection(file_arr, log_collection)
{
  var log_item;
  var insert_loc;
  var whitespace_str;
  var insert_str;
  var ori_line_idx;
  var e_str;
  var insert_arr = [];
  while (log_collection.length)
  { // log_collection must be a sorted list of logs to insert
    log_item = log_collection[log_collection.length - 1];
    ori_line_idx = log_item.e_loc.end.line - 1;
    e_str = file_arr[ori_line_idx];
    //console.log(e_str);
    if (log_item.blk_loc.arrow === true)
    { // unbraced arrow function has braces and log inserted on the same line (code will be formatted)
      insert_arr = gen_unblk_arrow_insert(log_item, e_str);
      file_arr[ori_line_idx] = insert_arr[0]; // overwrite current line
      file_arr = insert_arr_in_file_arr(file_arr, insert_arr.slice(1, insert_arr.length), ori_line_idx + 1); // insert remaining lines
    }
    else
    {
      // add triggers to insert array
      insert_loc = determine_blk_insert_loc(log_item, e_str);
      insert_arr.push(log_item.log_str);
      insert_arr = insert_arr.concat(log_item.triggers);
      file_arr = insert_arr_in_file_arr(file_arr, insert_arr, insert_loc.end.line);
    }
    insert_arr = [];
    log_collection.pop();
  }
  return file_arr;
}

function insert_arr_in_file_arr(file_arr, insert_arr, line_num)
{
  for (var i = 0; i < insert_arr.length; i++)
  {
    file_arr.splice(line_num + i, 0, insert_arr[i]);
  }
  return file_arr;
}

function gen_lumberjack_header(filename)
{
  var header = [];
  var logpath = '../log/';
  if (filename.length > 2 && filename.substr(0, 3) == '../')
  {
    logpath += filename.substr(3, filename.length) + '.log';
  }
  else
  {
    logpath += filename + '.log';
  }

  // see const_lumberjack_header_arr for details/structure
  header[0] = const_lumberjack_header_arr[0];
  header[1] = const_lumberjack_header_arr[1] + filename + const_lumberjack_header_arr[2] + logpath + const_lumberjack_header_arr[3];
  return header;
}

function gen_unblk_arrow_insert(log_item, e_str)
{
  var e_start = log_item.e_loc.start.column;
  var e_end = log_item.e_loc.end.column + 1;

  var insert_arr = [];
  // split based on where the { should be (beginning of emit)
  insert_arr.push(e_str.slice(0, e_start) + '{');
  insert_arr.push(e_str.slice(e_start, e_end));
  insert_arr.push(log_item.log_str);
  // add any triggers
  insert_arr = insert_arr.concat(log_item.triggers);
  insert_arr.push('}');
  return insert_arr;
}

// NOTE: the log_item loc lines are +1 than their positions in the file array (0 vs 1-indexed), so we don't need to
// increment them
function determine_blk_insert_loc(log_item)
{
  if (log_item.blk_loc.root === true || log_item.blk_loc.loc !== null)
  { // case where emit is not within a block statement (it is only within the top level Program)
    // or the block statement has an loc (it is safe to insert after the e_loc)
    return log_item.e_loc;
  }
}

function get_leading_whitespace(line)
{
  var whitespace_len = line.search(/\S|$/);
  var whitespace_str = '';
  while (whitespace_len)
  {
    whitespace_str = whitespace_str + ' ';
    whitespace_len--;
  }
  return whitespace_str;
}

function write_format_file_arr(file_arr, filename)
{
  var file = fs.createWriteStream(filename);
  file.on('error', function (err)
  { /* error handling */
    console.log(err);
  });
  //format the file after we write it
  file.on('finish', function ()
  {
    util.format_file(filename);
  });

  // write to file
  file_arr.forEach(function (v)
  {
    file.write(v + '\n');
  });

  file.end();
}

//console.log(insert(file_str, log_item));

