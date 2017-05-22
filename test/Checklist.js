
global.jchecks = require('../jchecks.js');
      

describe("src/ts/Checklist.ts", function () {
  var assert = require('should');
  var util = require('util');
  var examplejs_printLines;
  function examplejs_print() {
    examplejs_printLines.push(util.format.apply(util, arguments));
  }
  
  this.timeout(300000);

  it("Checklist:base", function (done) {
    examplejs_printLines = [];
  var flag = 0;
  var flagTimer = setInterval(function () {
      flag++
  }, 1000)

  var checklist = new jchecks.Checklist({
    stepItems: [{
      checker: function () {
        examplejs_print('checker 1')
        return flag > 0
      },
      processor: function () {
        examplejs_print('processor 1')
        return null
      },
      timeout: 5000,
    }, {
    }, {
      checker: function () {
        examplejs_print('checker 2')
        return flag > 3
      },
      processor: function () {
        examplejs_print('processor 2')
        return null
      },
    }, {
      checker: function () {
        examplejs_print('checker 3')
        return flag > 4
      },
      processor: function () {
        examplejs_print('processor 3')
        return 'error 3'
      },
      timeout: 0,
    }]
  })
  checklist.once('error', function (error) {
    examplejs_print('once error: %j', error)
  })
  checklist.once('stop', function () {
    clearInterval(flagTimer)
    assert.equal(examplejs_printLines.join("\n"), "checker 1\nchecker 1\nprocessor 1\nchecker 2\nchecker 2\nprocessor 2\nchecker 3\nprocessor 3\nonce error: \"error 3\""); examplejs_printLines = [];

    done();
  })
  checklist.start()
  });
          
  it("Checklist:timeout", function (done) {
    examplejs_printLines = [];
  var flag = 0;
  var checklist = new jchecks.Checklist({
    stepItems: [{
      checker: function () {
        return flag > 0
      },
      processor: function () {
        return null
      },
      timeout: 500,
    }]
  })
  checklist.once('error', function (error) {
    examplejs_print('once error: %j', error)
  })
  checklist.once('stop', function () {
    assert.equal(examplejs_printLines.join("\n"), "once error: \"timeout\""); examplejs_printLines = [];

    done();
  })
  checklist.start()
  });
          
  it("Checklist:coverage", function () {
    examplejs_printLines = [];
  var checklist = new jchecks.Checklist();
  checklist.run();
  checklist.next();
  checklist.start();

  var checklist = new jchecks.Checklist({
    timeout: 2000,
    stepItems: [{
      checker: function() {

      },
      processor: function () {

      }
    }]
  });
  checklist.start();
  checklist.start();

  examplejs_print(checklist.items.length);
  assert.equal(examplejs_printLines.join("\n"), "1"); examplejs_printLines = [];
  });
          
});
         