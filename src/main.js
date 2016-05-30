
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

  var emit_logs = logs[0];
  var listener_logs = logs[1];

  //console.log(JSON.stringify(ast))

  for(var k = 0; k < emit_logs.length; k++)
  {
    console.log(emit_logs[k][0] + " " + emit_logs[k][1]);
  }

  for(var l = 0; l < listener_logs.length; l++)
  {
    console.log(listener_logs[l][0] + " " + listener_logs[l][1]);
  }

}

main()
