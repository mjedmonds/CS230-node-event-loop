// const readline = require('readline');
const fs = require('fs');
var LineByLineReader = require('line-by-line');
var file_str = "test.txt";
var arr = [];
var insert_tuple = [[1,"hey insert to 1"],[2,"hey insert to 2"],[5,"hey insert to 5"],[10,"hey insert to 10"]];

function writeTextFile(filepath, array) {

}

function file_to_array_insert(array, file, linnum_string, callback){
    var lr = new LineByLineReader(file);

	lr.on('line', function (line) {
		array.push(line); // 'line' contains the current line without the trailing newline character.
		//console.log(array);
	});

	lr.on('end', function () {
		insert_to_array(array, linnum_string);// All lines are read, file is closed now.
		console.log(array);
		
		var file = fs.createWriteStream('array.txt');
		file.on('error', function(err) { /* error handling */ });
		
		array.forEach(function(v) { file.write(v + '\n'); });

		file.end();




		return array;
	});
	
};

/// INSERTION 

function insert_to_array(array, linnum_string){

	while(linnum_string.length){
		array.splice(linnum_string[linnum_string.length-1][0],0,linnum_string[linnum_string.length-1][1])
		linnum_string.pop();
	}
};


console.log(file_to_array_insert(arr, file_str, insert_tuple));

