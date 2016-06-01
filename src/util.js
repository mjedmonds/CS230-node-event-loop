module.exports = {
// compares two loc objects
  compare_loc: function compare_loc(loc_a, loc_b)
  {
    if (loc_a.line < loc_b.line)
    {
      return -1;
    }
    else if (loc_a.line > loc_b.line)
    {
      return 1;
    }
    else
    { // lines are equal, comapre columns
      if (loc_a.column < loc_b.column)
      {
        return -1;
      }
      else if (loc_a.column > loc_b.column)
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