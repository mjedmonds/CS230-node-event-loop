const EventEmitter = require('event');
const util = require('util');

// function examples
function func1() {
  emit_obj.emit('func1Emit');
log.info('func1 emitting event func1Emit')
};
var func2 = function () { emit_obj.emit('func2Emit');};
log.info('func2 emitting event func2Emit')
var func3 = function func3_1() {
  emit_obj.emit('func3Emit');
log.info('func3_1 emitting event func3Emit')
};

(function func4() { emit_obj.emit('func4Emit'); });
log.info('func4 emitting event func4Emit')
(function () { emit_obj.emit('anon0Emit'); });
log.info('anon1 emitting event anon0Emit')

var func5 = function func5_1() {(function () { emit_obj.emit('func5Emit');
log.info('func5_1 emitting event func5Emit')
})}();
var func6 = function () {(function () { emit_obj.emit('func6Emit'); });
log.info('func6 emitting event func6Emit')
}();

var obj1 = { func7: function func7_1(){(function () {emit_obj.emit('func7Emit');});
log.info('func7_1 emitting event func7Emit')
} };
var obj2 = { func8: function (){(function () {emit_obj.emit('func8Emit');});
log.info('func8 emitting event func8Emit')
} };

function counter1() {
  var count1 = 0;
  return function c1() {
    emit_obj.emit('c1Emit');
log.info('c1 emitting event c1Emit')
    emit_obj.emit('c1Emit2');
log.info('c1 emitting event c1Emit2')
    alert(count1++);
  }
}

function counter2() {
  var count2 = 0;
  return function() {
    emit_obj.emit('c2Emit');
log.info('counter2 emitting event c2Emit')
    alert(count2++);
    myEmitter.on('func3Emit', func3);
log.info('func3Emit triggers callback func3')
  }
}

var func9 = (emit_obj) => { emit_obj.emit('func9Emit'); };
log.info('func9 emitting event func9Emit')
var func10 = (emit_obj) => emit_obj.emit('func10Emit');
log.info('func10 emitting event func10Emit')

/* ------------------------------------------------------------- */
// // XXX: it looks like these are not relevant, Function is assumed to already be a function (e.g. function Function() {})
// // var func11 = new Function();
// // var func12 = new Function.apply(this);
// //
// // Function.apply(this).apply(this);
/* ------------------------------------------------------------- */

//example of emit
var emittingFunc = function () {
  a = 5 + 2;
  emit_obj.emit('emmitFuncEmit');
log.info('emittingFunc emitting event emmitFuncEmit')
}

// example of listener
// server.on('connection', (stream) => {
//   console.log('someone connected!');
// });

function MyEmitter() {
  EventEmitter.call(this);
}
util.inherits(MyEmitter, EventEmitter);

const myEmitter = new MyEmitter();

myEmitter.on('anonArrowFuncEmit', () => {
log.info('anonArrowFuncEmit triggers callback anon0')
  console.log('an event occurred!');
});

myEmitter.on('func1Emit', func1);
log.info('func1Emit triggers callback func1')
myEmitter.on('func2Emit', func2);
log.info('func2Emit triggers callback func2')

myEmitter.on('func4Emit', func4);
log.info('func4Emit triggers callback func4')

myEmitter.once('func5Emit', func5);
log.info('func5Emit triggers callback func5once')

