// colors 兼容 phantomjs
global.process = {
  env: {
    COLORTERM: true
  },
  argv: [],
};
var colors = require('colors');

var jchecks = require('../');
var page = require('webpage').create();
var url = 'https://www.baidu.com/';

var step_openbaidu = {
  name: 'step_openbaidu',
  processor: function () {
    page.open(url);
  },
};

var step_searchCheckList = {
  name: 'step_searchCheckList',
  checker: function () {
    return page.evaluate(function () {
      return !!document.querySelector('#kw');
    });
  },
  processor: function () {
    page.evaluate(function () {
      document.querySelector('#kw').value = 'checklist';
      document.querySelector('#su').click();
    })
  },
};

var step_nextpage = {
  name: 'step_nextpage',
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
};

var nextpageChecklist = new jchecks.Checklist({
  timeout: 60 * 0000,
  items: [step_nextpage]
});

var step_pageN = function (n) {
  return {
    name: 'step_pageN(' + n + ')',
    checker: function () {
      nextpageChecklist.start();
      return page.evaluate(function (n) {
        return document.readyState === 'complete' && n === parseInt(document.querySelector('#page > strong').textContent.trim());
      }, n);
    },
    processor: function () {
      var text = page.evaluate(function () {
        return document.querySelector('#page > strong').textContent;
      });
      console.log("page: " + text);
    },
  };
};

var checklist = new jchecks.Checklist({
  timeout: 15 * 1000,
  items: [
    step_openbaidu,
    step_searchCheckList,
    step_pageN(3),
  ],
});

var checklist_error = '';
checklist.on('error', function (error) {
  checklist_error += error + '\n';
  console.error(colors.red(error));
}).on('stop', function () {
  if (checklist_error) {
    phantom.exit(1);
  } else {
    phantom.exit();
  }
}).on('process', function (item) {
  console.log(colors.green('process: ' + item.name));
}).on('check', function (item) {
  console.log(colors.cyan('check: ' + item.name));
});

page.onError = function (msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function (t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
    });
  }
  console.error(colors.red(msgStack.join('\n')));
};

checklist.start();