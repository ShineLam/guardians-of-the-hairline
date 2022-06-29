const conf = require('./conf.js')
/**
 * 应用工具包
 */

// 启动版本更新管理
const startUpdateManager = () => {
  if (!wx.canIUse("getUpdateManager")) {
    wx.showModal({
      title: "提示",
      content: '当前微信版本过低，请升级到最新微信版本。'
    })
    return
  }
  // 版本更新管理器
  const updateManager = wx.getUpdateManager()
  // 监听向微信后台请求检查更新结果事件。微信在小程序冷启动时自动检查更新，不需由开发者主动触发
  updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    console.log('【版本更新】 是否有新版本:', res.hasUpdate)
  })
  // 监听小程序有版本更新事件。客户端主动触发下载（无需开发者触发），下载成功后回调
  updateManager.onUpdateReady(function () {
    console.log('【版本更新】 有版本更新:')
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          // 强制小程序重启并使用新版本。在小程序新版本下载完成后（即收到 onUpdateReady 回调）调用。
          updateManager.applyUpdate()
        }
      }
    })
  })
  // 监听小程序更新失败事件。小程序有新版本，客户端主动触发下载（无需开发者触发），下载失败（可能是网络原因等）后回调
  updateManager.onUpdateFailed(function () {
    console.log('【版本更新】 小程序版本更新失败')
  })
  return updateManager
}

// 提示信息
const toast = (msg, dur) => {
  wx.showToast({
    title: msg || '',
    icon: 'none',
    duration: dur || 4000 // 提示的延迟时间
  })
}

// 判断两个列表是否相等
const isEqualList = function (list, nlist, eqfn) {
  let i = 0
  if (list.length && list.length === nlist.length) {
    for (let v1, v2; (v1 = list[i]) && (v2 = nlist[i]); i++) {
      if (!eqfn(v1, v2)) {
        return false
      }
    }
    return i === list.length
  }
}

// arguments转换为数组
const args = (a) => {
  return Array.prototype.slice.call(a)
}

// 通用的数据类型判断(type: null,string,number,boolean,function,array,object)
const is = (type, val) => {
  if (type === null || (val === null || val === undefined)) {
    return (type === null || type === undefined) && (val === null || val === undefined)
  } else {
    if (type === 'object') {
      return Object.prototype.toString.call(val) === '[object Object]'
    } else {
      if (typeof (val) === type) {
        return true
      } else if (type === 'array') {
        return Object.prototype.toString.call(val) == '[object Array]'
      } else {
        return false
      }
    }
  }
}

// 判断是否为函数(因为经常使用，所以单独提供方法,也可以使用is方法)
const isFun = (val) => {
  return typeof (val) === 'function'
}
// 判断是否为字符串(因为经常使用，所以单独提供方法,也可以使用is方法)
const isStr = (val) => {
  return typeof (val) === 'string'
}
// 判断是否为Bool(因为经常使用，所以单独提供方法,也可以使用is方法)
const isBool = (val) => {
  return typeof (val) === 'boolean'
}
// 判断是否为Number(因为经常使用，所以单独提供方法,也可以使用is方法)
const isNum = (val) => {
  return typeof (val) === 'number'
}
// 判断是否为数组(因为经常使用，所以单独提供方法,也可以使用is方法)
const isArray = (val) => {
  return Object.prototype.toString.call(val) == '[object Array]'
}
// 判断是否为对象(因为经常使用，所以单独提供方法,也可以使用is方法)
const isObj = (val) => {
  return Object.prototype.toString.call(val) === '[object Object]'
}
// 判断值是否为null
const isNull = (val) => {
  return val === null || val === undefined
}

// 是否超时
const isTimeoutSecs = (diffSecs, t1ms, t2ms) => {
  return t1ms && t2ms && Math.abs(t1ms - t2ms) >= ((diffSecs || 0) * 1000)
}

// 是否车牌号码
const isPltNum = (val) => {
  return val && /(^[\u4E00-\u9FA5]{1}[A-Z0-9]{6}$)|(^[A-Z]{2}[A-Z0-9]{2}[A-Z0-9\u4E00-\u9FA5]{1}[A-Z0-9]{4}$)|(^[\u4E00-\u9FA5]{1}[A-Z0-9]{5}[挂学警军港澳]{1}$)|(^[A-Z]{2}[0-9]{5}$)|(^(08|38){1}[A-Z0-9]{4}[A-Z0-9挂学警军港澳]{1}$)/.test(val)
}
// 是否手机号
const isMobile = (val) => {
  return val && /^1(3|4|5|6|7|8|9)\d{9}$/.test(val)
}

// 值是否在对象中(数组/字符串/对象)
const $in = (val, ctx) => {
  let type = typeof (ctx)
  if (type === 'string') {
    return ctx.indexOf(val) >= 0
  } if (type === 'object' && isArray(ctx)) {
    for (let i = 0, len = list ? list.length : 0; i < len; i++) if (list[i] == val) return true;
  } else {
    return (val in ctx)
  }
}

// 判断第一个函数并执行
const callonefn = (needNextfn, ...fns) => {
  for (let i = 1, fn, arg; i < fns.length; i++) {
    arg = fns[i]
    if (typeof (arg) === 'function') {
      if (!needNextfn) {
        arg.call()
        break
      } else if (fn) {
        fn.call()
        break
      }
      f0 = arg
    }
  }
}

// 获取对象属性值
const getObjValue = (ctx, props, def) => {
  if (props && typeof (props) === 'string') {
    let i = 0;
    while (ctx) {
      i = props.indexOf('.')
      if (i == -1) {
        return ctx[props]
      } else {
        ctx = ctx[props.substring(0, i)]
        props = props.substring(i + 1)
        if (ctx === null || ctx === undefined) {
          return def
        }
      }
    }
  }
}

// 设置对象属性值
const setObjValue = (ctx, props, val) => {
  if (props && typeof (props) === 'string') {
    let i = 0;
    while (ctx) {
      i = props.indexOf('.')
      if (i == -1) {
        ctx[props] = val
        return true
      } else {
        ctx = ctx[props.substring(0, i)]
        props = props.substring(i + 1)
        if (ctx === null || ctx === undefined) {
          return false
        }
      }
    }
  }
}

// 清空
const unset = (ctx, props, def) => {
  if (isArray(props)) {
    props.forEach(e => ctx[e] = def || '')
  } else if (isObj(props)) {
    let val
    for (let key in props) {
      val = props[key]
      if (val === null || val === undefined) {
        val = def || ''
      }
      ctx[key] = val
    }
  }
  return ctx
}

// 获取指定类型的值
const getTypeValue = (type, ...values) => {
  for (let i = 0, arg; i < values.length; i++) {
    if (is(type, arg)) {
      return arg
    }
  }
}

// 获取当前页面路径(未获取到时返回指定的默认值)
const getCurrentpath = def => {
  let pages = getCurrentPages()
  if (pages && pages.length) {
    return pages[pages.length - 1].route
  } else {
    return def
  }
}

// 是否为tabpage页面path
const isTabPagepath = path => {
  return path.startsWith('/pages/tabs/') || (path.startsWith('tab-') === 0)
}

// 补齐页面路径(页面路径规则(3级规则): 模块/对象/操作)
// eg: admin-team-list ==> detail, team-detail, admin-team-detail
const fullPagepath = path => {
  let i = path.indexOf('/')
  if (i == -1) {
    i = path.indexOf('-')
    // tab页面(其他任何页面不能使用tab-开头，并且规定死路径)
    if (path.startsWith('tab-')) {
      return '/pages/tabs/' + path.substring(i + 1) + '/' + path
    }
    // 其他页面处理
    let curPath = getCurrentpath()
    let j = i == -1 ? -1 : path.indexOf('-', i + 1)
    if (i !== -1 && j !== -1) {
      // 其他对象(为了强制规范化,这里部分路径直接写死)
      let paths = path.split('-')
      path = '/pages/modules/' + paths[0] + '/' + paths[1] + '/' + path
    } else {
      // 当前对象
      i = j != -1 ? curPath.indexOf('-') : curPath.lastIndexOf('-')
      path = curPath.substring(0, i + 1) + path
    }
  }
  console.log(path.charCodeAt(0) === '/'.charCodeAt(0) ? path : '/' + path)
  return path.charCodeAt(0) === '/'.charCodeAt(0) ? path : '/' + path
}

// 系列化data(变成键值对字符串方式)
const serialize = (data, path0, encode0) => {
  let buf = []
  let path = isStr(path0) ? path0 : (isStr(encode0) ? encode0 : '')
  let encode = isBool(path0) ? path0 : (isBool(encode0) ? encode0 : '')

  if (path) {
    buf.push(path)
    buf.push(path.indexOf('?') === -1 ? '?' : '')
  }

  if (data) {
    for (let key in data) {
      let val = data[key]
      if (!isFun(val)) {
        buf.push(key, '=', (isNull(val) ? '' : (encode ? encodeURIComponent(val) : val)), '&')
      }
    }
  }

  let last = buf.length && buf[buf.length - 1]
  if (last === '&' || last === '?') {
    buf.pop()
  }

  return buf.join('')
}

// 过滤tab-bar跳转参数
const checkTabpageParams = (params, cb) => {
  let tabpageparams = {}
  if (isObj(params)) {
    for (let name in params) {
      let val = params[name]
      let type = typeof (val)
      if ((type === 'string' || type === 'number' || type === 'boolean')) {
        tabpageparams[name] = val
      }
    }
  }
  if (tabpageparams.tabarId && !conf.TABS[tabpageparams.tabarId]) {
    console.log('【Tab跳转】 参数检查失败|未定义的tabarId', tabpageparams.tabarId)
  } else {
    cb && cb(tabpageparams)
  }
}

// 页面跳转(method=2时使用redirectTo方式)
const navNext = (path, params, method, cb, fb) => {
  path = fullPagepath(path)
  console.log(path)
  const wxparams = {
    success: function (res) {
      callonefn(false, params, method, cb, fb)
    },
    fail: function () {
      callonefn(true, fb, cb, method, params)
    }
  }
  if (isTabPagepath(path)) {
    checkTabpageParams(params, (saleParams) => {
      getApp().globalData.lastTabpageParams = saleParams
      if (saleParams.tabarId) {
        conf.setTabarId(saleParams.tabarId)
      }
      wxparams.url = path
      let pages = getCurrentPages()
      let curPage = pages && pages.length && pages[pages.length - 1]
      if (curPage && typeof (curPage.setTabcontent) === 'function') {
        curPage.setTabcontent(saleParams.tabarId)
      } else {
        wx.switchTab(wxparams)
        console.log(wxparams)
      }
    })
  } else {
    getApp().globalData.lastTabpageParams = null
    wxparams.url = isObj(params) ? serialize(params, path, true) : path
    let type = getTypeValue('number', params, method, cb, fb)
    if (type === 2) {
      wx.redirectTo(wxparams)
    } else {
      wx.navigateTo(wxparams)
    }
  }
}

// 页面返回: 关闭当前页面，返回上一页面或多级页面。可通过 getCurrentPages 获取当前的页面栈，决定需要返回几层。
const navBack = (delta, cb, fb) => {
  let yesfn = isFun(delta)
  wx.navigateBack({
    delta: yesfn ? 1 : (delta || 1),
    success: function () {
      ((yesfn && delta()) || (cb && cb()))
    },
    fail: function () {
      ((yesfn && cb && cb()) || (fb && fb()))
    }
  })
}

// 跳转到首页
const navIndex = (params) => {
  let path = '/pages/index/index'
  let delta = -1
  let pages = getCurrentPages()
  if (pages && pages.length) {
    for (let i = 0; i < pages.length; i++) {
      if ('pages/index/index' === pages[i].route) {
        delta = pages.length - i
        break
      }
    }
  }
  if (delta != -1) {
    navNext(path, params)
  } else {
    navBack(delta)
  }
}

// 检查登录态是否过期
const checkWexSession = (okfn, nkfn) => {
  wx.checkSession({
    success(res) {
      // session_key 未过期
      console.log('【session_key未过期】', res)
      okfn && okfn()
    },
    fail(res) {
      // session_key 已经失效，需要重新执行登录流程(wx.login())
      console.log('【session_key已失效】', res)
      nkfn && nkfn()
    }
  })
}

// 获取微信用户信息
const getWexUserInfo = (opts, cb, fb) => {
  wx.getSetting({
    success: function (setting) {
      console.log('【用户信息】 获取配置成功: ', setting)
      wx.getUserInfo({
        withCredentials: true,
        success: function (authInfo) {
          console.log('【用户信息】 获取授权信息成功: ', authInfo)
          cb && cb(authInfo)
        },
        fail: function (err) {
          console.log('【用户信息】 获取授权信息失败: ', err)
          let errMsg = '获取授权信息失败'
          if (err.errMsg === 'getUserInfo:fail auth deny') {
            errMsg = '您已拒绝授权'
          }
          fb && fb({ code: 'getUserInfo.fail', msg: errMsg, wxerr: err })
        }
      })
    },
    // 获取设置失败
    fail: function (nk) {
      console.log('【用户信息】 获取配置失败: ', nk)
      fb && fb({ code: 'getSetting.fail', msg: '获取配置失败', wxerr: err })
    }
  })
}
// 打开微信设置页面
const openWexSetting = (options, cb, fb) => {
  const success = (res) => {
    if (res.confirm) {
      wx.openSetting({
        success: (res) => cb && cb(res),
        fail: () => fb && fb({ code: 'openSetting.fail', msg: options.openSettingfail || '打开设置页失败' })
      })
    } else {
      if (res.cancel) {
        fb && fb({ code: 'showModal.cancel', msg: options.showModalcancel || '您已取消' })
      } else {
        fb && fb({ code: 'showModal.err', msg: options.showModalerr || '打开弹窗失败' })
      }
    }
  }
  wx.showModal({
    title: options.title,
    content: options.desc,
    success: (res) => success(res),
    fail: () => fb && fb({ code: 'showModal.fail', msg: options.showModalfail || '打开弹窗失败' })
  })
}

// 关闭监听实时位置变化，前后台都停止消息接收
const stopWexLocationUpdate = cb => {
  wx.stopLocationUpdate({
    success: function () {
      console.log('【位置服务】 停止位置(成功)')
      cb && cb(true)
    },
    fail: function (errmsg) {
      cb && cb(false, errmsg)
      console.log('【位置服务】 停止位置(失败)', errmsg)
      let msg = (errmsg || {}).errMsg || ''
      if (!cb) {
        if (msg.indexOf('真机') === -1 && msg.indexOf('not enabled') === -1) {
          toast('停止位置服务失败')
        }
      }
    }
  })
}

// 启动位置监听(后台方式)
const startLocUpdateBackground = (options, cb, fb) => {
  // 配置信息
  const opts = Object.assign({
    title: '位置授权',
    desc: '我们需要获取您的地理位置权限，请选择“使用小程序期间和离开小程序后”权限',
    openSettingfail: '打开设置失败，继续开启位置服务？',
    showModalcancel: '您已取消了位置授权，更多功能将无法为您提供服务，是否继续开启位置服务？',
    showModalerr: '打开设置询问窗口失败，是否继续开启位置服务？',
    getSettingfail: '获取您的位置服务配置失败，是否继续开启位置服务？',
    startLocfail: '启动位置服务失败，是否继续开启位置服务？',
    authUserLocation: '设置错误，请选择“使用小程序期间和离开小程序后”这一项权限',
    unsetUserLocBackground: '您尚未设置开启位置服务，很抱歉相关功能将不能为了您提供服务'
  }, options || {})

  // 处理用户设置
  const processUserSettings = function (res, next) {
    if (res.authSetting['scope.userLocationBackground']) {
      stopWexLocationUpdate((sok, smsg) => {
        console.log('【位置服务】 停止位置服务结果:', sok, smsg)
        wx.startLocationUpdateBackground({
          success: () => {
            console.log('【位置服务】 启动服务(成功)', res)
            cb && cb(res)
          },
          fail: (err) => {
            console.log('【位置服务】 启动服务(失败)', err)
            fb && fb({ code: 'startlocbrg.fail', msg: opts.startLocfail, err: err, res: res })
          }
        })
      })
    } else {
      if (next) {
        next()
      } else {
        if (res.authSetting['scope.userLocation']) {
          fb && fb({ code: 'startlocbrg.auth_uloc', msg: opts.authUserLocation, res: res })
        } else {
          fb && fb({ code: 'startlocbrg.unset', msg: opts.unsetUserLocBackground, res: res })
        }
      }
    }
  }

  // 处理获取配置成功
  const getSettingSuccess = (res) => {
    processUserSettings(res, () => {
      openWexSetting(opts, ok => {
        processUserSettings(ok)
      }, nk => {
        fb && fb(nk)
      })
    })
  }

  // 获取用户设置信息
  wx.getSetting({
    success: (res) => getSettingSuccess(res),
    fail: (err) => fb && fb({ code: 'getSetting.fail', msg: opts.getSettingfail, err: err })
  })
}

// 本地存储(key值建议定义在conf.js文件中，需要注意：如果存在cb回调函数则认为是异步操作，否则为同步操作)
const save = (key, data, cb, fb) => {
  try {
    if (cb && typeof (cb) === 'function') {
      // 异步存储
      wx.setStorage({
        key: key,
        data: data,
        success() {
          cb()
        },
        fail(nk) {
          console.log('【本地存储】 本地存储失败: key: ', key, ', data: ', data, ', err: ', nk)
          fb && fb(nk)
        }
      })
    } else {
      // 同步存储
      wx.setStorageSync(key, data)
    }
  } catch (e) {
    fb && fb(e)
  }
}
// 获取本地存储内容(key值建议定义在conf.js文件中，需要注意：如果存在cb回调函数则认为是异步操作，否则为同步操作)
const unsave = (key, cb, fb) => {
  try {
    if (cb && typeof (cb) === 'function') {
      // 异步获取
      wx.getStorage({
        key: key,
        success(res) {
          cb(res.data)
        },
        fail(nk) {
          console.log('【本地存储】 获取存储失败: key: ', key, ', err: ', nk)
          fb && fb(nk)
        }
      })
    } else {
      // 同步获取
      return wx.getStorageSync(key)
    }
  } catch (e) {
    fb && fb(e)
  }
}

// 调起客户端扫码界面进行扫码
const scan = (cb, fb) => {
  wx.scanCode({
    onlyFromCamera: true, // 是否只能从相机扫码，不允许从相册选择图片
    success(res) {
      console.log(res)
      cb && cb(res)
    },
    fail(err) {
      console.error(err)
      fb && fb()
    }
  })
}

// 获取地理位置
const getLocation = (type, cb, fcb) => {
  wx.getLocation({
    type: type || 'gcj02',
    altitude: true,
    isHighAccuracy: true,
    success(res) {
      let pos = {
        lat: res.latitude,
        lng: res.longitude
      }
      cb && cb(pos)
    },
    fail(err) {
      console.error(err)
      fcb && fcb(err.errMsg)
    }
  })
}

// 获取位置
const getLoc = (cb, fcb, force) => {
  let fbFun = () => {
    openLocAuthSetting(() => {
      console.log('授权位置成功，重新获取位置')
      getLocation('gcj02', cb, fcb)
    }, () => {
      // 授权失败，提示返回
      console.log('授权位置失败，提示返回')
      wx.showToast({
        title: '您尚未授权地理位置',
        icon: 'none',
        duration: 3000
      })
      fcb && fcb()
    })
  }
  getLocation('gcj02', cb, force ? fbFun : fcb)
}

// 枚举映射
const mapping = (val, enums) => {
  for (let i = 0, len = enums ? enums.length : 0; i < len; i++) if (enums[i++] == val) return enums[i];
}

// 创建数组
const fromto = (from, to, pad0) => {
  let nums = []
  for (let i = from; i <= to; i++) {
    nums.push(pad0 && i < 10 ? '0' + i : i)
  }
  return nums
}

const chooseMedia = (cb) => {
  wx.chooseMedia({
    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有,
    mediaType: ['image'], // mix 可同时选择图片和视频
    // sourceType: type,
    success: res => {
      // 返回选定照片的本地文件路径列表，imgPath可以作为img标签的src属性显示图片
      let files = res.tempFiles
      let path = []
      files.forEach(file => path.push(file.tempFilePath))
      console.log('[选中的媒体]', path)
      cb && cb(path)
    }
  })
}

const setNavTitle = (title) => {
  wx.setNavigationBarTitle({ title })
}

const setNavColor = (front, back) => {
  wx.setNavigationBarColor({
    backgroundColor: back,
    frontColor: front,
    animation: {
      duration: 400,
      timingFunc: 'easeIn'
    }
  })
}


// 导出
module.exports = {
  startUpdateManager,
  toast,
  args,
  getObjValue,
  setObjValue,
  unset,
  is,
  isFun,
  isStr,
  isArray,
  isObj,
  isNull,
  isPltNum,
  isMobile,
  isEqualList,
  isTimeoutSecs,
  getCurrentpath,
  isTabPagepath,
  fullPagepath,
  serialize,
  navBack,
  navNext,
  navIndex,
  checkWexSession,
  callonefn,
  getTypeValue,
  getWexUserInfo,
  openWexSetting,
  stopWexLocationUpdate,
  save,
  unsave,
  scan,
  getLoc,
  startLocUpdateBackground,
  mapping,
  fromto,
  chooseMedia,
  setNavTitle,
  setNavColor
}
