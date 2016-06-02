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
  
  append_filename: function append_filename(filename, append){
    return filename.substr(0, filename.lastIndexOf('.')) + append + filename.substr(filename.lastIndexOf('.'), filename.length);
  }
}