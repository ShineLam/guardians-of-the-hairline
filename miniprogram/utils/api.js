const ext = require('./ext.js')
const conf = require('./conf.js')
const util = require('./util.js')

// 挂起队列
const LOGIN_SUSPEND_QUEUE = []
// 数据接口标准操作
const MOD_STDOPs = [
  // 根据ID获取
  'get', 'GET', '/$/{}.do',
  // 数据查询
  'list', 'POST', '/$/list.do',
  // 新增数据
  'add', 'POST', '/$/add.do',
  // 更新数据
  'upd', 'POST', '/$/upd.do',
  // 删除数据
  'del', 'GET', '/$/del/{}.do'
]
// 数据接口
const MOD_APIs = ['Ptuser:is,binding']
// URI接口(非标准路径接口)
const URI_APIs = {
  // 预登陆(静默登陆)
  preLogin: 'GET /app/pre_login.do',
  // 发送短信验证码
  sendSms: 'GET /sms/code/send.do',
  // 检查验证码是否正确
  checkCode: 'GET /sms/code/check.do',
  // 获取当前用户
  curUser: 'GET /user/cur.do',
  // 解密微信加密数据(如请求用户授权获取手机号)
  decrypt: 'POST /wex/decrypt.do',
  // 请求用户授权，用户授权后发送相关信息到服务器上进行处理
  sendUserAuthInfo: 'POST /app/auth.do'
}

// 获取全局数据
const getGlobal = (name) => {
  let data = getApp().globalData || {}
  return data[name]
}
// 设置全局数据
const setGlobal = (name, value) => {
  let data = getApp().globalData
  if (data) {
    data[name] = value
  }
  return value
}

// 存储session
const setSession = session => {
  setGlobal('session', session)
  wx.setStorage({
    key: 'SERVER_SESSION',
    data: session
  })
  console.log('【会话管理】 会话存储', session)
}

// 获取session
const getSession = () => {
  let session = getGlobal('session') || {}
  if (!session.token) {
    let val = wx.getStorageSync('SERVER_SESSION')
    if (val && val.token) {
      session = val
      getApp().globalData.session = session
    }
    console.log('【会话管理】 会话获取', val)
  }
  return session
}

// 清除会话信息
const cleanSession = () => {
  setSession({})
}

// 获取访问令牌
const getToken = () => {
  return getSession().token || ''
}

// 显示错误信息
const showError = msg => {
  console.log('【错误提示】', msg)
  util.toast(msg)
}

// 调用或显示错误信息
const callOrShowerr = function (fb, err) {
  if (fb && typeof (fb) === 'function') {
    fb(err)
  } else {
    util.toast(util.isStr(err) ? err : (err.msg || '抱歉，服务出错啦'))
  }
}

// 获取当前页对象
const getCurrentPageObject = () => {
  let pages = getCurrentPages()
  return pages && pages.length && pages[pages.length - 1]
}

// 填充完整
const fullUrl = (uri) => {
  if (uri.indexOf('://') != -1) {
    return uri
  } else {
    return conf.API_URL_PREFIX + '/' + uri
  }
}

// 检查网络
const checkNetwork = (cb, fb) => {
  wx.getNetworkType({
    success: function(res) {
      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
      // var networkType = res.networkType
      cb && cb(res.isConnected, res.networkType)
    },
    fail: function() {
      fb && fb()
    }
  })
}

// 创建API函数
const buildApiFn = (fname, url, method, options, urlPrefix) => {
  url = url.indexOf('://') > 0 ? url : (urlPrefix || conf.API_URL_PREFIX) + url
  let pathParamIdx0 = url.indexOf('{')
  let pathParamIdx1 = url.indexOf('}')
  // 接口函数
  let apifn = (params, cb, fb, opts) => {
    let reqUrl = url
    if (pathParamIdx0 >= 0 && pathParamIdx1 > pathParamIdx0) {
      if (params === undefined || params === null || params === '') {
        fb && fb({ code: 508, msg: '路径参数为空' })
        return
      }
      reqUrl = url.substring(0, pathParamIdx0) + params + url.substring(pathParamIdx1 + 1)
      params = {}
    }
    send((method || 'POST'), reqUrl, params, cb, fb)
  }
  apifn.fname = fname
  apifn.url = url
  apifn.method = method
  apifn.options = options
  return apifn
}

// 解析URI接口定义(GET/POST/JSON/TEXT/HTML)
const parseUriDefinition = (name, uri, urlPrefix) => {
  let i = (uri = uri.trim()) && uri.indexOf(' ')
  let type = (i && uri.substring(0, i).toUpperCase())
  uri = (i && type && uri.substring(type.length).trim()) || uri
  let method = util.mapping(type, ['GET', 'GET', 'POST', 'POST', 'TEXT', 'GET', 'JSON', 'POST', 'HTML', 'GET'])
  // console.log('parseUriDefinition:', name, method, uri)
  return buildApiFn(name, uri, method, null, urlPrefix)
}

// 解析数据接口定义(MOD_OBJ:[OP_LIST], eg: User:is,ebl), MOD_STDOPs
const parseModDefinition = (mod, urlPrefix) => {
  let i = (mod = mod.trim()) && mod.indexOf(':')
  let modName = i == -1 ? mod : mod.substring(0, i)
  let objName = modName.substring(0, 1).toUpperCase() + modName.substring(1)
  let objPath = modName.toLowerCase()
  let custOps = i == -1 ? null : mod.substring(i + 1).split(',')
  let modApiFns = []
  //
  for (let i = 0, optype, fname, method, requri; i < MOD_STDOPs.length; i++) {
    optype = MOD_STDOPs[i++]
    method = MOD_STDOPs[i++]
    requri = MOD_STDOPs[i].replace('$', objPath)
    fname = optype === 'list' ? ('get' + objName + 'List') : (optype + objName)
    // console.log('parseModDefinition[1]:', fname, method, requri)
    modApiFns.push(buildApiFn(fname, requri, method, null, urlPrefix))
  }
  //
  for (let i = 0, len = custOps && custOps.length, optype, fname, requri; i < len; i++) {
    optype = custOps[i]
    requri = '/' + objPath + '/' + optype + '.do'
    fname = optype + objName
    // console.log('parseModDefinition[2]:', fname, 'POST', requri)
    modApiFns.push(buildApiFn(fname, requri, 'POST', null, urlPrefix))
  }

  return modApiFns
}

// 网络请求(通用)
const request = (method, url, data, cb, fb, opts) => {
  let contentType = data.$_json ? 'application/json' : (method == 'POST' ? 'application/x-www-form-urlencoded' : '')
  wx.request({
    url: url,
    data: data,
    method: method || 'GET',
    header: {
      'Content-Type': contentType
    },
    success: function (result) {
      cb && cb(result)
    },
    fail: function(e) {
      fb && fb(e)
    }
  })
}

// 拒绝挂起队列
const rejectSuspendQueue = (errmsg) => {
  console.log('【任务队列】 拒绝挂起任务(' + LOGIN_SUSPEND_QUEUE.length + ')')
  LOGIN_SUSPEND_QUEUE.forEach(e => {
    callOrShowerr(e.fb, errmsg)
  })
  LOGIN_SUSPEND_QUEUE.length = 0
}

// 执行挂起队列
const resolveSuspendQueue = () => {
  console.log('【任务队列】 执行挂起任务(' + LOGIN_SUSPEND_QUEUE.length + ')')
  LOGIN_SUSPEND_QUEUE.forEach(e => {
    resend(e)
  })
  LOGIN_SUSPEND_QUEUE.length = 0
}

// 请求用户登陆
const requestUserLogin = ctx => {
  let cbfn = typeof(ctx) === 'function' ? ctx : null
  let url = cbfn ? '' : (ctx || {}).url
  wx.login({
    fail: function (wxnk) {
      // 微信登陆失败
      console.log('【请求登陆】 微信登陆失败: url: ', url, wxnk)
      let msg = '微信登陆失败'
      checkNetwork((connected, type) => {
        let msg = !connected ? '请求服务失败，请检查网络是否正常' : msg
        rejectSuspendQueue({code: 'requestUserLogin.wxlogin.fail', msg: msg})
      }, nk => {
        rejectSuspendQueue({code: 'requestUserLogin.wxlogin.fail', msg: msg})
      })
      cbfn && cbfn(false, msg)
    },
    success: function (res) {
      console.log('【请求登陆】 微信登陆成功: url: ', url, res)
      api.preLogin({
        ticket: res.code,
        alias: conf.APP_ALIAS
      }, ok => {
        console.log('【请求登陆】 应用登陆成功(静默登陆): url: ', url, ok)
        if (!ok.token) {
          console.log('【请求登陆】 应用登陆成功(静默登陆)|分配访问令牌失败: url: ', url)
          let msg = '分配访问令牌失败'
          rejectSuspendQueue({code: 'preLogin.non_token', msg: msg})
          cbfn && cbfn(false, msg)
        } else {
          let data = ok.data
          setSession({
            token: ok.token || '',
            unionid: data.unionid || '',
            session_key: data.session_key || '',
            wex_login_code: res.code
          })
          // 执行挂起任务
          resolveSuspendQueue()
          cbfn && cbfn(true)
        }
      }, nk => {
        console.log('【请求登陆】 应用登陆失败(静默登陆): url: ', url, nk)
        let msg = nk.msg || '请求登陆失败'
        checkNetwork((connected, type) => {
          msg = !connected ? '请求服务失败，请检查网络是否正常' : msg
          rejectSuspendQueue({code: 'preLogin.fail', msg: msg})
        }, () => {
          rejectSuspendQueue({code: 'preLogin.fail', msg: msg})
        })
        cbfn && cbfn(false, msg)
      })
    }
  })
}

// 检查页面能力
const checkPageAbility = (fname, cb, fb) => {
  let page = getCurrentPageObject()
  if (!page) {
    fb && fb({code: 'not_found_page', msg: '未找到页面对象'})
  } else {
    let fn = page[fname]
    if (!fn) {
      fb && fb({code: 'not_setting', msg: '未设置'})
    } else if(typeof(fn) !== 'function') {
      fb && fb({code: 'not_function', msg: '设置错误'})
    } else {
      cb(page)
    }
  }
}

// 检查用户会话状态
const checkUserSession = (cb, fb) => {
  util.checkWexSession(ok => {
    cb && cb()
  }, nk => {
    requestUserLogin((ok, msg) => {
      if (ok) {
        cb && cb()
      } else {
        util.toast(msg || '请求登陆失败')
        fb && fb(msg)
      }
    })
  })
}

// 请求用户授权
const reuqestUserAuth = ctx => {
  checkPageAbility('openUserAuth', page => {
    page.openUserAuth(ctx, (userinfo) => {
      console.log('【用户授权】 请求用户授权成功: ', userinfo)
      resend(ctx)
    }, errmsg => {
      console.log('【用户授权】 请求用户授权失败: ', errmsg)
      callOrShowerr(ctx && ctx.fb, errmsg)
    })
  }, errmsg => {
    console.log('【用户授权】 页面能力检查失败: ', errmsg)
    callOrShowerr(ctx && ctx.fb, errmsg)
  })
}

// 请求手机号验证
const requestMblValid = ctx => {
  checkPageAbility('openMblValid', page => {
    page.openMblValid(ctx, ok => {
      console.log('【用户授权】 请求手机号验证成功: ', ok)
      resend(ctx)
    }, errmsg => {
      console.log('【手机验证】 请求手机号验证失败: ', errmsg)
      callOrShowerr(ctx && ctx.fb, errmsg)
    })
  }, errmsg => {
    console.log('【手机验证】 页面能力检查失败: ', errmsg)
    callOrShowerr(ctx && ctx.fb, errmsg)
  })
}

// 处理网络请求错误/接口访问错误
const processRespFail = (resp, ctx) => {
  if (resp.code == 700) {
    // 未登陆: 放入待登陆任务列表
    let empty = LOGIN_SUSPEND_QUEUE.length === 0;
    LOGIN_SUSPEND_QUEUE.push(ctx)
    console.log('【访问失败】 未登陆', empty ? '自动请求登陆: ' : '等待登陆后执行: ', ctx.url)
    if (empty) {
      requestUserLogin(ctx) 
    }
  } else if (resp.code == 701) {
    // 未授权: 设置当前请求待授权对象
    console.log('【访问失败】 未授权 自动打开授权', ctx.url)
    reuqestUserAuth(ctx)
  } else if (resp.code == 1002) {
    // 未验证: 手机号码未验证
    ctx.mbl = resp.msg || ''
    console.log('【访问失败】 未验证 自动打开验证', ctx.mbl, ctx.url)
    requestMblValid(ctx)
  } else if (resp.code == 508) {
    console.log('【访问失败】 解密数据失败(需要清除会话数据)', ctx.mbl, ctx.url)
    callOrShowerr(ctx.fb, resp)
  } else {
    callOrShowerr(ctx.fb, resp)
  }
}

// 网络请求(业务)
const send = (method, url, data, cb, fb, opts) => {
  data.token = getToken()
  data._ts = (new Date() - 0)
  method = method || 'GET'
  request(method, url, data, (result) => {
    // 请求正常
    var resp = result.data || {}
    if (typeof (resp) === 'string') {
      console.log('【接口访问】 请求成功(1): ', url, resp)
      cb && cb(resp)
    } else {
      // code = 200 或者不传或者为0则表示成功
      if (resp.code == 200 || (!resp.code && resp.status == null && !resp.error)) {
        console.log('【接口访问】 请求成功(2): ', url)
        cb && cb(resp)
      } else {
        if (resp.status === 404) {
          resp.code = 404
          resp.msg = '接口地址不存在'
        }
        console.log('【接口访问】 请求失败: ', url, ' 响应: ', resp)
        processRespFail(resp, {method, url, data, cb, fb, opts})
      }
    }
  }, (nk) => {
    // 请求错误
    console.log('【接口访问】 发生错误: ', url, nk)
    let errCode = '505'
    let errMsg = '网络开小差了'
    if (nk && util.isObj(nk)) {
      if(nk.errMsg === 'request:fail url not in domain list') {
        errMsg = '未配置安全域名'
      }
    }
    processRespFail({code: errCode, msg: errMsg}, {method, url, data, cb, fb, opts})
  })
}

// 重新发送请求
const resend = req => {
  if (req && req.url) {
    send(req.method, req.url, req.data, req.cb, req.fb, req.opts)
  }
}

// GET请求
const get = (url, params, okcb, nkcb, opts) => {
  send('GET', url, params, cb, fb, opts)
}

// POST请求
const post = (url, params, cb, fb, opts) => {
  send('POST', url, params, cb, fb, opts)
}

// 安装数据接口
const installModApi = (mods, ctx, urlPrefix) => {
  for (let i = 0, mod, modApifns, len = mods ? mods.length : 0; i < len; i++) {
    modApifns = (mod = mods[i]) && parseModDefinition(mod, urlPrefix)
    if (modApifns) {
      modApifns.forEach(apifn => {
        ctx[apifn.fname] = apifn
      })
    }
  }
}

// 安装URI接口
const installUriApi = (uris, ctx, urlPrefix) => {
  for (let name in  uris) {
    let val = uris[name]
    if (typeof(val) === 'string') {
      ctx[name] = parseUriDefinition(name, val, urlPrefix)
    }
  }
}

// 导出
const api = {
  cleanSession,
  request,
  send,
  get,
  fullUrl,
  checkPageAbility,
  checkUserSession,
  installModApi,
  installUriApi
}

// 安装API
installModApi(MOD_APIs, api)
installUriApi(URI_APIs, api)

// 再次处理需要过滤的方法
const sendUserAuthInfoEx = (wexUserInfo, cb, fb) => {
  let session = getSession() || {}
  var req = {
    ticket: session.wex_login_code, // 临时token
    alias: conf.APP_ALIAS,          // 应用别名
    sessionKey: session.session_key || '',
    encryptedData: wexUserInfo.encryptedData || '',
    iv: wexUserInfo.iv || ''
  }
  console.log('【授权处理】 发送授权信息参数: ', req)
  api.sendUserAuthInfo(req, ok => {
    console.log('【授权处理】 发送授权信息成功: ', ok)
    cb && cb(ok)
  }, nk => {
    console.log('【授权处理】 发送授权信息失败: ', nk)
    callOrShowerr(fb, nk)
  })
}

// 获取用户信息
const getUserProfile = (force, cb, fb) => {
  let user = getGlobal('user')
  // 不管三七二十一，只要存在用户信息，则先回调通知
  if (!force && user && user.id) {
    cb && cb(Object.assign({}, user))
  } else if (force || !user || !user.id) {
    // 是否需要重新加载
    api.isPtuser({}, ok => {
      let user = ok.data || {}
      setGlobal('user', user)
      cb && cb(Object.assign({}, user))
    }, fb)
  }
}

// 扩展
api.sendUserAuthInfoEx = sendUserAuthInfoEx
api.getUserProfile = getUserProfile

// 导出
module.exports = {
  api,
  ext,
  conf,
  util
}
