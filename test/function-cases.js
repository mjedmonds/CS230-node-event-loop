const events = require('events');
const util = require('util');

const myEmitter = new events.EventEmitter();

//if(true) console.log('test');

myEmitter.emit('ProgramEmit');

function func1() {
  myEmitter.emit('func1Emit', 'arg1', 'arg2');
}
var func2 = function () { myEmitter.emit('func2Emit');};
var func3 = function func3_1() {
  myEmitter.emit('func3Emit');
};

var func5 = function func5_1() {(function () { myEmitter.emit('func5Emit');
})()};
var func6 = function () {(function () { myEmitter.emit('func6Emit'); })();
};

var obj1 = { func7: function func7_1(){(function () {myEmitter.emit('func7Emit');})();
} };
var obj2 = { func8: function (){(function () {myEmitter.emit('func8Emit');})();
} };

(function func4() { myEmitter.emit('func4Emit'); })();
(function () { myEmitter.emit('anon0Emit'); })();

function counter1() {
  var count1 = 0;
  return function c1() {
    myEmitter.emit('c1Emit');
    myEmitter.emit('c1Emit2');
    alert(count1++);
  }
}

function counter2() {
  var count2 = 0;
  return function() {
    myEmitter.emit('c2Emit');
    alert(count2++);
    myEmitter.on('func3Emit', func3);
  }
}

// var func9 = () => { myEmitter.emit('func9Emit'); };
// var func10 = () => myEmitter.emit('func10Emit');


//example of emit
var emittingFunc = function () {
  a = 5 + 2;
  myEmitter.emit('emmitFuncEmit');
}

// example of listener
// server.on('connection', (stream) => {
//   console.log('someone connected!');
// });
function notProgram() {
  setTimeout(function () {
    myEmitter.emit('anonFuncEmit', new Error('blah'));
  }, 400);
}

function func11(){
  console.log('called func11');
}

function func12(){
  console.log('called func12');
}

function func16(){
  console.log('called func16');
}

function func13(){
  console.log('called func13');
}

function func15(){
  console.log('called func15');
}

main();

function main(){
  // myEmitter.on('anonFuncEmit', () => {
  //   console.log('an event occurred!');
  // });
  myEmitter.on('anonFuncEmit', function() {
    console.log('an event occurred!');
  });

  myEmitter.on('func1Emit', func11);
  myEmitter.on('func1Emit', func16);
  myEmitter.on('func2Emit', func12);

  myEmitter.on('func4Emit', func13);

  myEmitter.once('func5Emit', func15);

  func1();
  func2();
  func3();
  func5();
  func6();
  obj1.func7();
  obj2.func8();
  counter1();
  counter2();
  //func9();
  //func10();
  emittingFunc();


}
// /* ------------------------------------------------------------- */
// // // XXX: it looks like these are not relevant, Function is assumed to already be a function (e.g. function Function() {})
// // // var func11 = new Function();
// // // var func12 = new Function.apply(this);
// // //
// // // Function.apply(this).apply(this);
// /* ------------------------------------------------------------- */