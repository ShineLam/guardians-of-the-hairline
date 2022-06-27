/**
 * js扩展
 * 请不要把业务相关的方法写在这里
 */

const DATE_FMTS = ['', '', '', '', 'yyyy', '', 'yyyyMM', 'yyyy-MM', 'yyyyMMdd', '', 'yyyy-MM-dd', '', 'yyyyMMddhhmm', '', 'yyyyMMddhhmmss', '', 'yyyy-MM-dd hh:mm', '', '', 'yyyy-MM-dd hh:mm:ss']

// 根据格式获取日期值(field: y,M,d,h,m,s,S, fmt: yyyyMMdd)
String.prototype.fdate = function (field, fmt, def) {
  var str = this,
    l = this.length,
    val = 0,
    fmt = fmt || (l > 19 ? 'yyyy-MM-dd hh:mm:ss.SSS' : DATE_FMTS[l]),
    i = fmt.indexOf(field);
  if (i == -1) {
    return (def || val)
  }
  for (var len = fmt.length, c0_code = '0'.charCodeAt(0), cf_code = field.charCodeAt(0); i < len; i++) {
    if (fmt.charCodeAt(i) === cf_code) {
      val = (val * 10) + (str.charCodeAt(i) - c0_code)
    }
  }
  return val
}

// 根据日期格式format转换为日期对象
String.prototype.toDate = function (fmt) {
  var str = this,
    m = str.fdate('M', fmt, -1);
  return new Date(str.fdate('y', fmt), (m <= 0 ? 0 : m - 1), str.fdate('d', fmt, 1), str.fdate('h', fmt), str.fdate('m', fmt), str.fdate('s', fmt), str.fdate('S', fmt))
}

// 获取指定域值
Date.prototype.field = function (f) {
  return f === 'y' ? this.getFullYear() : (f === 'M' ? this.getMonth() + 1 : (f === 'd' ? this.getDate() : (f === 'h' ? this.getHours() : (f === 'm' ? this.getMinutes() : (f === 's' ? this.getSeconds() : (f === 'S' ? this.getMilliseconds() : -1))))))
}

// 日期格式化(yyyy-MM-dd hh:mm:ss)
Date.prototype.format = function (fmt) {
  fmt = fmt || 'yyyy-MM-dd hh:mm:ss'
  var str = new Array(fmt.length)
  for (var i = fmt.length - 1, ch, val; i >= 0;) {
    ch = fmt.charAt(i)
    val = this.field(ch)
    if (val == -1) {
      str[i--] = ch
    } else {
      while (fmt.charAt(i) === ch) {
        str[i--] = val % 10
        val = Math.floor(val / 10)
      }
    }
  }
  return str.join('')
}

// 更新日期值
Date.prototype.setValue = function (val, fmt) {
  var type = typeof (val)
  if (type === 'string') {
    this.setFullYear(val.fdate('y', fmt), val.fdate('M', fmt) - 1, val.fdate('d', fmt))
    this.setHours(val.fdate('h', fmt), val.fdate('m', fmt), val.fdate('s', fmt), val.fdate('S', fmt))
  } else {
    this.setTime(type === 'number' ? val : val.getTime())
  }
  return this
}

// 日期格式化(默认)
Date.prototype.yyyyMMdd = function () {
  return this.format('yyyy-MM-dd')
}
Date.prototype.yyyy_MM_dd = function () {
  return this.format('yyyy-MM-dd')
}
// 去除时分秒
Date.prototype.trim = function () {
  this.setHours(0, 0, 0, 0)
  return this
}
// 一个月的第一天
Date.prototype.toFirstDate = function (trim) {
  this.setFullYear(this.getFullYear(), this.getMonth(), 1)
  return trim ? this.trim() : this
}
// 一个月的最后一天
Date.prototype.toLastDate = function (trim) {
  this.toFirstDate(trim)
  this.setMonth(this.getMonth() + 1, 1)
  this.setDate(this.getDate() - 1)
  return this
}
// 使用整数表示
Date.prototype.toIntDate = function () {
  return this.getFullYear() * 10000 + (this.getMonth() + 1) * 100 + this.getDate()
}
// 添加天数
Date.prototype.addDays = function (days) {
  this.setDate(this.getDate() + days)
  return this
}
// 减少天数
Date.prototype.subDays = function (days) {
  this.setDate(this.getDate() - days)
  return this
}
// 添加月数
Date.prototype.addMonth = function (m) {
  this.setMonth(this.getMonth() + m)
  return this
}

/**
 * 按顺序执行 obj.fnName()
 * @param {Object} fnName
 * @param {Object} i
 * @param {Object} oneDone
 * @param {Object} allDone
 */
Array.prototype.execAll = function (fnName, i, oneDone, allDone) {
  let list = this,
    uploader = list[i]
  // 如果全部已完成
  if (uploader) {
    uploader[fnName](function (result) {
      allDone && oneDone(result)
      list.execAll(fnName, i + 1, oneDone, allDone)
    })
  } else {
    (allDone || oneDone)()
  }
}

/**
 * 全部上传
 * @param {Object} oneDone
 * @param {Object} allDone
 */
Array.prototype.upload = function (oneDone, allDone) {
  this.execAll('doUpload', 0, oneDone, allDone)
}

/**
 * 提取其中的字段
 * @param {Object} name
 */
Array.prototype.fetch = function (name) {
  var list = []
  for (var i = 0, item; item = this[i++];) {
    list.push(item[name])
  }
  return list
}

// 非空映射
Array.prototype.nmap = function (cb, rstList, unshift) {
  var list = rstList || []
  for (var i = 0, val, item; item = this[i++];) {
    val = cb (item, i, this)
    if (val !== null && val != undefined && val !== '') {
      if (unshift) {
        list.unshift(val)
      } else {
        list.push(val)
      }
    }
  }
  return list
}



/**
 * 将一维数据进行分组
 *
 * @param {Object} name
 */
Array.prototype.groupBy = function (name, filter) {
  let groups = [],
    grp, mapping = {};
  for (let i = 0, item, v, rtn; item = this[i++];) {
    v = item[name]
    grp = mapping[v]
    if (!grp) {
      grp = {
        name: v,
        count: 0,
        subs: []
      }
      mapping[v] = grp
      groups.push(grp)
    }
    rtn = filter && filter.call(grp, item, mapping)
    // 返回false表示过滤掉，返回null表示使用原来的值，否则使用返回的值
    if (rtn !== false) {
      item = rtn || item
      grp.subs.push(item)
      grp.count++
    }
  }
  return groups
}

Function.prototype.saturate = function (scope /*, args */ ) {
  var fn = this,
    afters = [].slice.call(arguments, 1);
  return function () {
    return fn.apply(scope, [].slice.call(arguments, 0).concat(afters))
  }
}

// 追加参数
Function.prototype.args = Function.prototype.saturate

// 混入
Function.prototype.mixin = function (rawfn) {
  var fn = this
  return function () {
    var args = [].slice.call(arguments, 0)
    try {
      fn.apply(this, args)
    } catch (e) {
      console.log(e)
    }
    rawfn.apply(this, args)
  }
}

// 延时执行
Function.prototype.timeout = function (time /*scope*/ ) {
  let fn = this
  let afters = [].slice.call(arguments, 1)
  let scope = (afters.length ? afters[afters.length - 1] : fn) || fn
  return function () {
    let args = [].slice.call(arguments, 0)
    setTimeout(function () {
      fn.apply(scope, args)
    }, time || 1000)
  }
}

// 加载页面分页数据
Function.prototype.loadPageData = function (ctx, query, cb, fb, opts) {
  let qryfn = this
  let pageNum = query.pageNum || 1
  // 阻止同时加载
  if (ctx.data.dataloading <= 0) {
    // 一般移动端不太关心统计数据，所以这里做些特殊处理
    let needCount = (query.count !== null && query.count !== undefined)
    try {
      ctx.data.dataloading++
      query.count = needCount ? pageNum === 1 : false
      // 加载数据
      qryfn(query, function (res) {
        // 重置恢复相关标识
        ctx.data.dataloading = 0
        query.pageNum = pageNum
        let isequal = isEqualPageData(ctx, res, query)
        if (isequal) {
          console.log('【数据加载】 两个数据列表相同(忽略处理)')
        } else {
          console.log('【数据加载】 过滤处理数据')
          // 过滤处理数据
          let list = ctx.filterPageList(query, res)
          cb && cb(res, list)
        }
      }, function (nk) {
        console.log('【数据加载】 接口请求失败', nk)
        // 重置恢复相关标识
        ctx.data.dataloading = 0
        query.pageNum = pageNum
        // 调用回调
        callOrShowerr(fb, nk)
      }, opts)
    } catch (e) {
      // 重置恢复相关标识
      ctx.data.dataloading = 0
      query.pageNum = pageNum
      query.count = needCount ? true : null
      //
      console.log('【数据加载】 脚本发生错误', e)
      callOrShowerr(fb, {
        code: 500,
        msg: '加载数据发生错误'
      })
    }
  } else {
    ctx.data.dataloading++
    if (ctx.data.dataloading >= 3) {
      util.toast('正在努力加载数据中')
    }
    console.log('【数据加载】 多次请求加载数据')
  }
}

/**
 * 倒计时
 * @param {Object} secs 运行的次数
 * @param {Object} delay 间隔时间(毫秒)
 */
Function.prototype.countdown = function (secs, delay /*, args,scope */ ) {
  let fn = this
  let afters = [].slice.call(arguments, 0)
  let scope = (afters.length ? afters[afters.length - 1] : fn) || fn
  // 延迟时间
  delay = arguments.length > 1 ? arguments[1] : 1000
  return function ( /*arguments*/ ) {
    let args = [].slice.call(arguments, 0)
    setTimeout(function () {
      if (fn.apply(scope, args.concat(secs)) != 'stop') {
        // -1表示永远运行
        if (secs > 1 || secs == -1) {
          afters[0] = secs == -1 ? -1 : secs - 1
          // 继续调用
          fn.countdown.apply(fn, afters).apply(scope, args)
        } else {
          let done = afters.length ? afters[args.length - 1] : null
          for (let i = 1; done = afters[i++];) {
            if (typeof (done) === "function") {
              done.apply(scope)
              break
            }
          }
        }
      }
    }, delay || 1000)
  }
}

module.exports = {
  DATE_FMTS
}