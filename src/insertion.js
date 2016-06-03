// const readline = require('readline');
const fs = require('fs');
const readline = require('readline');
const util = require('./util');

// array that represents the nessecary calls to bunyan to enable logging
// Note: between positions 2 and 3 (name) and 4 and 5 (path), the filename should be inserted
// this will be inserted after the last require() call in the source. If no require is found, insert at the beginning
const bunyan_insert_arr = [
  'const bunyan = require(\'bunyan\');',
  'var log = bunyan.createLogger({',
  'name: \'',
  '\',',
  'streams: [ {level: \'info\', path: \'',
  '\'}]',
  '});'
];

module.exports = {
  // parameters
  insert: function insert(filename, log_items, bunyan_insert_pos)
  {
    var instream = fs.createReadStream(filename);
    var outstream = new (require('stream'))(); // won't use this, just need to push lines into an array
    var rl = readline.createInterface(instream, outstream);
    var file_arr = [];

    rl.on('line', function (line)
    {
      file_arr.push(line); // 'line' contains the current line without the trailing newline character.
    });

    // once we're done reading the file, insert the tuples and write
    rl.on('close', function ()
    {
      //console.log(file_arr);
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
  var insert_loc;
  var whitespace_str;
  var insert_str;
  var ori_line_idx;
  var e_str;
  while (log_items.length)
  {
    log_item = log_items[log_items.length - 1];
    ori_line_idx = log_item.e_loc.end.line - 1
    e_str = file_arr[ori_line_idx];
    //console.log(e_str);
    if (log_item.blk_loc.arrow == true)
    {
      console.log('found arrow func, not logging');
      log_items.pop();
      continue;
    }
    else
    {
      insert_loc = determine_insert_loc(log_item, e_str);
    }
    whitespace_str = get_leading_whitespace(e_str);
    insert_str = whitespace_str + log_items[log_items.length - 1].log_str;
    // the -2 is account for 1) line indexing starts at 1, but array indexing starts at 0 and 2) want to insert log before emit
    file_arr.splice(insert_loc.end.line, 0, insert_str);
    log_items.pop();
  }
  return file_arr;
}

// NOTE: the log_item loc lines are +1 than their positions in the file array (0 vs 1-indexed), so we don't need to
// increment them
function determine_insert_loc(log_item)
{
  if (log_item.blk_loc.root == true || log_item.blk_loc.loc != null)
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

