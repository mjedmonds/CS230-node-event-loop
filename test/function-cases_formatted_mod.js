const bunyan = require('bunyan');
var lumberjack = bunyan.createLogger({ name: '../test/function-cases_formatted_mod.js', streams: [ {level: 'info', path: '../test/function-cases_formatted_mod.js'}]});
// const EventEmitter = require('event');
// const util = require('util');


//if(true) console.log('test');

function func1() {
  emit_obj.emit('func1Emit');
  lumberjack.info('func1 emitting event func1Emit');
}
var func2 = function() {
  emit_obj.emit('func2Emit');
  lumberjack.info('func2 emitting event func2Emit');
};
var func3 = function func3_1() {
  emit_obj.emit('func3Emit');
  lumberjack.info('func3_1 emitting event func3Emit');
};

emit_obj.emit('ProgramEmit');
lumberjack.info('Program emitting event ProgramEmit');

var func5 = function func5_1() {
  (function() {
    emit_obj.emit('func5Emit');
    lumberjack.info('func5_1 emitting event func5Emit');
  })()
};
var func6 = function() {
  (function() {
    emit_obj.emit('func6Emit');
    lumberjack.info('func6 emitting event func6Emit');
  })();
};

var obj1 = {
  func7: function func7_1() {
    (function() {
      emit_obj.emit('func7Emit');
      lumberjack.info('func7_1 emitting event func7Emit');
    })();
  }
};
var obj2 = {
  func8: function() {
    (function() {
      emit_obj.emit('func8Emit');
      lumberjack.info('func8 emitting event func8Emit');
    })();
  }
};

(function func4() {
  emit_obj.emit('func4Emit');
  lumberjack.info('func4 emitting event func4Emit');
})();
(function() {
  emit_obj.emit('anon0Emit');
  lumberjack.info('anon0 emitting event anon0Emit');
})();

function counter1() {
  var count1 = 0;
  return function c1() {
    emit_obj.emit('c1Emit');
    lumberjack.info('c1 emitting event c1Emit');
    emit_obj.emit('c1Emit2');
    lumberjack.info('c1 emitting event c1Emit2');
    alert(count1++);
  }
}

function counter2() {
  var count2 = 0;
  return function() {
    emit_obj.emit('c2Emit');
    lumberjack.info('counter2 emitting event c2Emit');
    alert(count2++);
    myEmitter.on('func3Emit', func3);
    lumberjack.info('func3Emit triggers callback func3');
  }
}

var func9 = (emit_obj) => {
  emit_obj.emit('func9Emit');
  lumberjack.info('func9 emitting event func9Emit');
};
var func10 = (emit_obj) => {
emit_obj.emit('func10Emit');
lumberjack.info('func10 emitting event func10Emit');
}

//
// //example of emit
// var emittingFunc = function () {
//   a = 5 + 2;
//   emit_obj.emit('emmitFuncEmit');
// }
//
// // example of listener
// // server.on('connection', (stream) => {
// //   console.log('someone connected!');
// // });
//
// function MyEmitter() {
//   EventEmitter.call(this);
// }
// util.inherits(MyEmitter, EventEmitter);
//
// const myEmitter = new MyEmitter();
//
// myEmitter.on('anonArrowFuncEmit', () => {
//   console.log('an event occurred!');
// });
//
// myEmitter.on('func1Emit', func1);
// myEmitter.on('func2Emit', func2);
//
// myEmitter.on('func4Emit', func4);
//
// myEmitter.once('func5Emit', func5);
//


// /* ------------------------------------------------------------- */
// // // XXX: it looks like these are not relevant, Function is assumed to already be a function (e.g. function Function() {})
// // // var func11 = new Function();
// // // var func12 = new Function.apply(this);
// // //
// // // Function.apply(this).apply(this);
