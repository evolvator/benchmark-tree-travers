var Benchmark = require('benchmark');
var tb = require('travis-benchmark');
var _ = require('lodash');
var async = require('async');
var foreach = require('foreach');
var arrayEach = require('array-each');

async.timesSeries(
  15,
  function(t, next) {
    var count = Math.pow(2, t);
    var suite = new Benchmark.Suite(`${count} array.length`);

    var array = _.times(count, function(t) {
      return t;
    });

    suite.add('for', function() {
      for (var i = 0; i < count; i++) {
        array[i];
      };
    });
    suite.add('while', function() {
      var i = 0;
      while (i < count) {
        i++;
        array[i];
      }
    });
    suite.add('for-in', function() {
      for (var i in array) {
        array[i];
      }
    });
    suite.add('for-of', function() {
      for (var f of array) {
        f;
      }
    });
    suite.add('forEach', function() {
      array.forEach(function(value, index) {
        value;
      });
    });
    suite.add('lodash@1.0.1 forEach', function() {
      _.forEach(array, function(value, index) {
        value;
      });
    });
    suite.add('async@2.6.1 forEachOf', function() {
      async.forEachOf(array, function(value, index, next) {
        value;
        next();
      });
    });
    suite.add('async@2.6.1 forEachOfSeries', function() {
      async.forEachOfSeries(array, function(value, index, next) {
        value;
        next();
      });
    });
    suite.add('foreach@2.0.5', function() {
      foreach(array, function(value, index) {
        value;
      });
    });
    suite.add('array-each@1.0.0', function() {
      arrayEach(array, function(value, index) {
        value;
      });
    });

    tb.wrapSuite(suite);
    suite.run({ async: true });
  }
);
