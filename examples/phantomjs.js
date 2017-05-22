var jchecks = require('../');
var page = require('webpage').create();
var url = 'https://www.baidu.com/';

var checklist = new jchecks.Checklist({
  timeout: 60 * 1000, // 一分钟
  stepItems: [
    {
      processor: function () {
        page.open(url);
      },
    },
    {
      checker: function () {
        return page.evaluate(function () {
          return document.readyState === 'complete' && !!document.querySelector('#kw');
        });
      },
      processor: function () {
        page.evaluate(function () {
          document.querySelector('#kw').value = 'checklist';
          document.querySelector('#su').click();
        })
      },
    },
    {
      checker: function () {
        return page.evaluate(function () {
          return document.readyState === 'complete' && !!document.querySelector('.head_nums_cont_inner .nums');
        });
      },
      processor: function () {
        var text = page.evaluate(function () {
          var result = document.querySelector('#page > strong').textContent;
          document.querySelector('#page .n:last-child').click();
          return result;
        });
        console.log(text);
      },
    },
    {
      checker: function () {
        return page.evaluate(function () {
          return document.readyState === 'complete' && /^\s*2\s*$/.test(document.querySelector('#page > strong').textContent);
        });
      },
      processor: function () {
        var text = page.evaluate(function () {
          return document.querySelector('#page > strong').textContent;
        });
        console.log("page: " + text);
      },
    },
  ]
});
checklist.start();

var checklist_error = '';
checklist.on('error', function (error) {
  checklist_error += error + '\n';
  console.error(error);
}).on('stop', function () {
  if (checklist_error) {
    phantom.exit(1);
  } else {
    phantom.exit();
  }
}).on('process', function (item) {
  console.log('process step: ' + this.items.indexOf(item));
}).on('check', function (item) {
  console.log('check step: ' + this.items.indexOf(item));
});

page.onError = function(msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }
  console.error(msgStack.join('\n'));
};