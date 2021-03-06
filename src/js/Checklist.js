"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Emitter_1 = require("h5emitter/src/ts/Emitter");
/*<function name="Checklist">*/
/**
 * @example Checklist:base
  ```js
  var flag = 0;
  var flagTimer = setInterval(function () {
      flag++
  }, 1000)

  var checklist = new jchecks.Checklist({
    items: [{
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
    items: [{
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
    items: [{
      checker: function() {

      },
      processor: function () {

      }
    }]
  });
  checklist.start();
  checklist.start();

  console.log(checklist.items.length);
  // > 1
  ```
*/
var Checklist = (function (_super) {
    __extends(Checklist, _super);
    function Checklist(options) {
        var _this = _super.call(this) || this;
        options = options || {};
        _this._items = options.items || [];
        _this._interval = options.interval || 1000;
        _this._timeout = options.timeout || 5000;
        return _this;
    }
    Object.defineProperty(Checklist.prototype, "items", {
        get: function () {
            return this._items;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 主动运行状态机
     */
    Checklist.prototype.run = function () {
        if (!this._timer) {
            return;
        }
        var item = this._items[this._stepIndex];
        if (!item) {
            this.stop();
            return;
        }
        var timeout = item.timeout === undefined ? this._timeout : item.timeout;
        var delay = null;
        if (timeout > 0) {
            delay = Date.now() - this._stepTime;
            if (delay > timeout) {
                this.error('timeout');
                return;
            }
        }
        this.emit('check', item, timeout, delay);
        if (item.checker === undefined || item.checker()) {
            if (item.processor !== undefined) {
                this.emit('process', item);
                var error = item.processor();
                if (error) {
                    this.error(error);
                    return;
                }
            }
            this.next();
        }
    };
    Checklist.prototype.start = function () {
        var _this = this;
        if (this._timer) {
            this.stop();
        }
        this._timer = setInterval(function () {
            _this.run();
        }, this._interval);
        this._stepIndex = 0;
        this._stepTime = Date.now();
        this.run();
        this.emit('start');
    };
    /**
     * To the next step
     */
    Checklist.prototype.next = function () {
        this._stepIndex++;
        this._stepTime = Date.now();
        var item = this._items[this._stepIndex];
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
        clearInterval(this._timer);
        this._timer = 0;
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
}(Emitter_1.Emitter)); /*</function>*/
