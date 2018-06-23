var Benchmark = require('benchmark');
var tb = require('travis-benchmark');
var _ = require('lodash');
var Chance = require('chance');
var chance = new Chance();

function generateTree(current, depth, width) {
    if (depth) {
        for (var i = 0; i < width; i++) {
            var key = chance.word();
            current[key] = {};
            generateTree(current[key], depth - 1, width);
        }
    }
    return current;
}

var async = require('async');
var foreach = require('foreach');
var arrayEach = require('array-each');

async.timesSeries(
  5,
  function(t, next) {
    var count = Math.pow(2, t);
    var tree = generateTree({}, count, 5);
    var suite = new Benchmark.Suite(`tree depth: ${count}, width: 10, factor: 0.25`);
    
    function recursiveTraverse(current, handler) {
      handler(current);
      // fastest based on https://github.com/evolvator/benchmark-each-by-object
      if (typeof(current) === 'object') {
        if (Array.isArray(current)) {
          for (var i = 0; i < current.length; i++) {
            recursiveTraverse(current[i], handler);
          };
        } else {
          var array = Object.keys(current);
          for (var i = 0; i < array.length; i++) {
            recursiveTraverse(current[array[i]], handler);
          };
        }
      }
    };
    
    suite.add('recursive', function() {
      recursiveTraverse(tree, function(current) {});
    });
    
    function stackTraverse(current, handler) {
      var stack = [{ data: current, index: -1, keys: typeof(current) === 'object' && !Array.isArray(current) ? Object.keys(current) : undefined }];
      while (stack.length) {
        var pointer = stack[stack.length - 1];
        if (pointer.index === -1) handler(pointer, stack);
        pointer.index++;
        if (typeof(pointer.data) === 'object') {
          var key = pointer.keys ? pointer.keys[pointer.index] : pointer.index;
          if (pointer.data.hasOwnProperty(pointer.keys[pointer.index])) {
            stack.push({ data: pointer.data[key], index: -1, key: key, keys: typeof(pointer.data[key]) === 'object' && !Array.isArray(pointer.data[key]) ? Object.keys(pointer.data[key]) : undefined });
          } else {
            stack.pop();
          }
        } else {
          stack.pop();
        }
      }
    };
    
    suite.add('stack', function() {
      stackTraverse(tree, function(current) {});
    });

    tb.wrapSuite(suite, () => next());
    suite.run({ async: true });
  }
);
