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
  stepItems?: StepItem[]
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
class Checklist extends Emitter {

  timer: number
  StepIndex: number
  StepTime: number
  stepItems: StepItem[]
  interval: number
  timeout: number

  constructor(options?: ChecklistOptions) {
    super()

    options = options || {}
    this.stepItems = options.stepItems || []
    this.interval = options.interval || 1000
    this.timeout = options.timeout || 5000
  }

  get items() {
    return this.stepItems;
  }

  /**
   * 主动运行状态机
   */
  run() {
    if (!this.timer) {
      return
    }
    let item = this.stepItems[this.StepIndex]
    if (!item) {
      this.stop()
      return
    }
    let timeout = item.timeout === undefined ? this.timeout : item.timeout
    if (timeout > 0) {
      let delay = Date.now() - this.StepTime
      if (delay > timeout) {
        this.error('timeout')
        return
      }
    }

    this.emit('check', item)
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
    if (this.timer) {
      this.stop()
    }

    this.timer = setInterval(() => {
      this.run()
    }, this.interval)
    this.StepIndex = 0
    this.StepTime = Date.now()
    this.run()

    this.emit('start')
  }

  /**
   * To the next step
   */
  next() {
    this.StepIndex++
    this.StepTime = Date.now()
    let item = this.stepItems[this.StepIndex]

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
    clearInterval(this.timer)
    this.timer = 0
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