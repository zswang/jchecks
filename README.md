jchecks
-----------

# [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coverage-image]][coverage-url]

checklist

## 使用方法

### 示例

```js
  var flag = 0;
  var flagTimer = setInterval(function () {
      flag++;
  }, 1000);
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
    }]
  });
```

## License

MIT © [zswang](http://weibo.com/zswang)

[npm-url]: https://npmjs.org/package/jchecks
[npm-image]: https://badge.fury.io/js/jchecks.svg
[travis-url]: https://travis-ci.org/zswang/jchecks
[travis-image]: https://travis-ci.org/zswang/jchecks.svg?branch=master
[coverage-url]: https://coveralls.io/github/zswang/jchecks?branch=master
[coverage-image]: https://coveralls.io/repos/zswang/jchecks/badge.svg?branch=master&service=github