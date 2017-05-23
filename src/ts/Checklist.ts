import { Emitter } from 'h5emitter/src/ts/Emitter'

export interface StepChecker {
  (...argv): boolean
}

export interface StepProcessor {
  (...argv): string
}

export interface StepItem {
  /**
   * 当前状态完成检测
   */
  checker: StepChecker
  /**
   * 处理当前任务
   */
  processor: StepProcessor
  /**
   * 检查超时
   */
  timeout?: number
}

interface ChecklistOptions {
  interval?: number
  items?: StepItem[]
  timeout?: number
}

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
class Checklist extends Emitter {

  private _items: StepItem[]
  private _timer: number
  private _stepIndex: number
  private _stepTime: number
  private _interval: number
  private _timeout: number

  constructor(options?: ChecklistOptions) {
    super()

    options = options || {}
    this._items = options.items || []
    this._interval = options.interval || 1000
    this._timeout = options.timeout || 5000
  }

  get items() {
    return this._items;
  }

  /**
   * 主动运行状态机
   */
  run() {
    if (!this._timer) {
      return
    }
    let item = this._items[this._stepIndex]
    if (!item) {
      this.stop()
      return
    }
    let timeout = item.timeout === undefined ? this._timeout : item.timeout
    let delay = null
    if (timeout > 0) {
      delay = Date.now() - this._stepTime
      if (delay > timeout) {
        this.error('timeout')
        return
      }
    }

    this.emit('check', item, timeout, delay)
    if (item.checker === undefined || item.checker()) {
      if (item.processor !== undefined) {
        this.emit('process', item)
        let error = item.processor()
        if (error) {
          this.error(error)
          return
        }
      }
      this.next()
    }
  }

  start() {
    if (this._timer) {
      this.stop()
    }

    this._timer = setInterval(() => {
      this.run()
    }, this._interval)
    this._stepIndex = 0
    this._stepTime = Date.now()
    this.run()

    this.emit('start')
  }

  /**
   * To the next step
   */
  next() {
    this._stepIndex++
    this._stepTime = Date.now()
    let item = this._items[this._stepIndex]

    if (item) {
      this.emit('next')
    } else {
      this.stop()
    }
  }

  /**
   * 停止检测
   */
  stop() {
    clearInterval(this._timer)
    this._timer = 0
    this.emit('stop')
  }

  /**
   * 检测出现异常
   *
   * @param error 错误信息
   */
  error(error: string) {
    this.emit('error', error)
    this.stop()
  }
} /*</function>*/