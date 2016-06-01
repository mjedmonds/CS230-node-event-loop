const insertor = require('./insertion');
const ast_parser =  require('./ast_parser');

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
