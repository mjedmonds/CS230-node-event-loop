
const insertor = require('./insertion');
const ast_parser =  require('./ast_parser');

var insert_tuple = [[1, "hey insert to 1"], [2, "hey insert to 2"], [5, "hey insert to 5"], [10, "hey insert to 10"]];

// var bunyan = require('bunyan');
// var log = bunyan.createLogger({
//   name: 'CS230',
//   streams: [ {level: 'info', path: 'out.txt'}]
//
// });


function main()
{
  var logs = ast_parser.collect_loggings('./function-cases.js');


  insertor.insert('./function-cases.js', logs);
  //console.log(JSON.stringify(ast))

  // for(var k = 0; k < logs.length; k++)
  // {
  //   console.log(logs[k][0] + " " + logs[k][1]);
  // }

}

main()
