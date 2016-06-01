// const readline = require('readline');
const fs = require('fs');
const LineByLineReader = require('line-by-line');
const util = require('./util');

module.exports = {
  // parameters
  insert: function insert(filename, log_items, bunyan_insert_pos)
  {
    var lr = new LineByLineReader(filename);
    var file_arr = []; // array that represents a file

    lr.on('line', function (line)
    {
      file_arr.push(line); // 'line' contains the current line without the trailing newline character.
      //console.log(file_arr);
    });

    // once we're done reading the file, insert the tuples and write
    lr.on('end', function ()
    {
      file_arr = insert_log_items(file_arr, log_items);// All lines are read, file is closed now.
      //console.log(file_arr);
      var out_file = util.append_filename(filename, '_mod');
      write_file_arr(file_arr, out_file);
    });
  }
}

// log_items should be a sorted list of lines to insert
function insert_log_items(file_arr, log_items)
{
  var log_item;
  var insert_line_num;
  var ori_line_idx;
  var whitespace_str;
  var insert_str;
  while (log_items.length)
  {
    log_item = log_items[log_items.length - 1];
    insert_line_num = determine_insert_loc(log_item);
    ori_line_idx = insert_line_num - 1;
    whitespace_str = get_leading_whitespace(file_arr[ori_line_idx]);
    insert_str = whitespace_str + log_items[log_items.length - 1][1];
    // the -2 is account for 1) line indexing starts at 1, but array indexing starts at 0 and 2) want to insert log before emit
    file_arr.splice(insert_line_num, 0, insert_str);
    log_items.pop();
  }
  return file_arr;
}

function determine_insert_loc(log_item)
{
  if (log_item.blk_loc == null)
  { // case where emit is not within a block statement (it is only within the top level Program)
    return log_item.e_loc;
  }
  else if (log_item.blk_loc.line != log_item.e_loc.line)
  { // if the blk_loc isn't on the same line (e.g. the block doesn't 
    log_item.e_loc.line += 1;
    return log_item.e_loc;
  }
  else if (log_item.blk_loc == log_item)
  {

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

//console.log(insert(file_str, log_item));

