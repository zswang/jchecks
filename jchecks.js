(function (exportName) {
  /*<function name="Emitter">*/
/**
 * @file h5emitter
 * @url https://github.com/zswang/h5emitter.git
 * event emitter function
 * @author
 *   zswang (http://weibo.com/zswang)
 * @version 1.0.0
 * @date 2017-05-20
 * @license MIT
 */
/**
 * 创建事件对象
 '''<example>'''
 * @example base
  ```js
  var emitter = new h5emitter.Emitter();
  emitter.on('click', function (data) {
    console.log('on', data);
  });
  emitter.once('click', function (data) {
    console.log('once', data);
  });
  function bee(data) {
    console.log('bee', data);
  }
  emitter.on('click', bee);
  emitter.on('click2', function (data) {
    console.log('on', data);
  });
  emitter.emit('click2', 'hello 1');
  // > on hello 1
  emitter.emit('click', 'hello 1');
  // > on hello 1
  // > once hello 1
  // > bee hello 1
  emitter.emit('click', 'hello 2');
  // > on hello 2
  // > bee hello 2
  emitter.off('click', bee);
  emitter.emit('click', 'hello 3');
  // > on hello 3
  ```
 '''</example>'''
 */
var Emitter = (function () {
    function Emitter() {
        /**
         * 事件列表
         */
        this.callbacks = [];
    }
    /**
     * 事件绑定
     *
     * @param event 事件名
     * @param fn 回调函数
     * @return 返回事件实例
     */
    Emitter.prototype.on = function (event, fn) {
        this.callbacks.push({
            event: event,
            fn: fn,
        });
        return this;
    };
    /**
     * 取消事件绑定
     *
     * @param event 事件名
     * @param fn 回调函数
     * @return返回事件实例
     */
    Emitter.prototype.off = function (event, fn) {
        this.callbacks = this.callbacks.filter(function (item) {
            return !(item.event === event && item.fn === fn);
        });
        return this;
    };
    /**
     * 事件绑定，只触发一次
     *
     * @param event 事件名
     * @param fn 回调函数
     * @return 返回事件实例
     */
    Emitter.prototype.once = function (event, fn) {
        function handler() {
            this.off(event, handler);
            fn.apply(this, arguments);
        }
        this.on(event, handler);
        return this;
    };
    /**
     * 触发事件
     *
     * @param event 事件名
     * @param fn 回调函数
     * @return 返回事件实例
     */
    Emitter.prototype.emit = function (event) {
        var _this = this;
        var argv = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            argv[_i - 1] = arguments[_i];
        }
        this.callbacks.filter(function (item) {
            return item.event === event;
        }).forEach(function (item) {
            item.fn.apply(_this, argv);
        });
        return this;
    };
    return Emitter;
}()); /*</function>*/
  /* istanbul ignore next */
  var __extends = (function () {
    var extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  })();
  /*<function name="Checklist">*/
/**
 * @example Checklist:base
  ```js
  var flag = 0;
  var flagTimer = setInterval(function () {
      flag++
  }, 1000)
  var checklist = new jchecks.Checklist({
    stepItems: [{
      checker: function () {
        console.log('checker 1')
        return flag > 0
      },
      processor: function () {
        console.log('processor 1')
        return null
      },
      timeout: 5000,
    }, {
      checker: function () {
        console.log('checker 2')
        return flag > 3
      },
      processor: function () {
        console.log('processor 2')
        return null
      },
    }, {
      checker: function () {
        console.log('checker 3')
        return flag > 4
      },
      processor: function () {
        console.log('processor 3')
        return 'error 3'
      },
      timeout: 0,
    }]
  })
  checklist.once('error', function (error) {
    console.log('once error: %j', error)
  })
  checklist.once('stop', function () {
    clearInterval(flagTimer)
    // > checker 1
    // > checker 1
    // > processor 1
    // > checker 2
    // > checker 2
    // > checker 2
    // > processor 2
    // > checker 3
    // > processor 3
    // > once error: "error 3"
    // * done
  })
  checklist.start()
  ```
 * @example Checklist:timeout
  ```js
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
    console.log('once error: %j', error)
  })
  checklist.once('stop', function () {
    // > once error: "timeout"
    // * done
  })
  checklist.start()
  ```
 * @example Checklist:coverage
  ```js
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
  ```
*/
var Checklist = (function (_super) {
    __extends(Checklist, _super);
    function Checklist(options) {
        var _this = _super.call(this) || this;
        options = options || {};
        _this.stepItems = options.stepItems || [];
        _this.interval = options.interval || 1000;
        _this.timeout = options.timeout || 5000;
        return _this;
    }
    /**
     * 运行状态机
     */
    Checklist.prototype.run = function () {
        var item = this.stepItems[this.StepIndex];
        if (!item) {
            this.stop();
            return;
        }
        var timeout = item.timeout === undefined ? this.timeout : item.timeout;
        if (timeout > 0) {
            var delay = Date.now() - this.StepTime;
            if (delay > timeout) {
                this.error('timeout');
                return;
            }
        }
        if (item.checker()) {
            var error = item.processor();
            if (error) {
                this.error(error);
                return;
            }
            this.next();
        }
    };
    Checklist.prototype.start = function () {
        var _this = this;
        if (this.timer) {
            this.stop();
        }
        this.timer = setInterval(function () {
            _this.run();
        }, this.interval);
        this.StepIndex = 0;
        this.StepTime = Date.now();
        this.run();
        this.emit('start');
    };
    /**
     * To the next step
     */
    Checklist.prototype.next = function () {
        this.StepIndex++;
        this.StepTime = Date.now();
        var item = this.stepItems[this.StepIndex];
        if (item) {
            this.emit('next');
        }
        else {
            this.stop();
        }
    };
    /**
     * 停止检测
     */
    Checklist.prototype.stop = function () {
        clearInterval(this.timer);
        this.emit('stop');
    };
    /**
     * 检测出现异常
     *
     * @param error 错误信息
     */
    Checklist.prototype.error = function (error) {
        this.emit('error', error);
        this.stop();
    };
    return Checklist;
}(Emitter)); /*</function>*/
  var exports = {
    Checklist: Checklist
  };
  /* istanbul ignore next */
  if (typeof define === 'function') {
    if (define.amd || define.cmd) {
      define(function () {
        return exports;
      });
    }
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    window[exportName] = exports;
  }
})('jstates');