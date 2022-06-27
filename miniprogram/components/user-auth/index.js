const { mixin, api, util, conf } = require('../../utils/mixin.js')
Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  ctx: null,
  properties: {
  },
  data: {
    cfm: 0,
  },
  lifetimes: {
    ready() {
      this.dialog = this.selectComponent("#dialog")
    }
  },

  methods: {
    // 打开组件(开放给页面调用)
    open(opts, cb, fb) {
      this.ctx = { opts, cb, fb }
      this.setData({
        cfm: 1
      })
      api.checkUserSession(ok => {
        this.dialog.open()
      }, nk => {
        let msg = typeof(nk) === 'string' ? nk : (nk || {}).msg || '检查授权环境失败'
        this.processAuthFail({code: 'checkUserSession.fail', msg: msg})
        util.toast(msg)
      })
    },
    // 关闭组件(开放给页面调用)
    close() {
      this.ctx = null
      this.dialog.close()
    },
    // 用户取消
    onUserCancel() {
      console.log('【授权组件】 您已取消授权')
      // util.toast('您已取消授权，很抱歉不能为您提供相关服务')
      this.notifyCaller(false, '您已取消授权')
      this.close()
    },
    // 微信回调(用户确认)
    onWexcallbak(res) {
      this.dialog.close() // 暂时关闭
      console.log('【授权组件】 用户同意授权: ', res)
      util.getWexUserInfo({}, (wexUserInfo) => {
        console.log('【授权组件】 获取微信用户信息成功: ', wexUserInfo)
        this.processAuthSuc(wexUserInfo, errmsg => this.checkUserSeesionKey(errmsg))
      }, nk => {
        // getWexUserInfo.fail
        this.processAuthFail(nk)
      })
    },
    // 微信回调(再次确认)
    onWexcallbak2(res) {
      this.dialog.close() // 暂时关闭
      console.log('【授权组件】 用户再次同意授权: ', res)
      util.getWexUserInfo({}, (wexUserInfo) => {
        console.log('【授权组件】 再次获取微信用户信息成功: ', wexUserInfo)
        this.processAuthSuc(wexUserInfo)
      }, nk => {
        this.processAuthFail(nk)
      })
    },
    // 检查会话密钥
    checkUserSeesionKey (res) {
      if (res.code == 508) {  // 发送数据到后台解密，解密失败，一般是sessionKey的问题，需要重新登陆
        // 先清除session
        api.cleanSession()
        // 请求登陆
        api.requestUserLogin((ok, msg) => {
          if (ok) {
            // 再次授权/再次显示
            this.setData({ cfm: 1 })
            this.dialog.open()
          } else {
            util.toast(msg || res.msg || '处理授权失败')
            this.processAuthFail(res)
          }
        })
      } else {
        // 其他非解密错误
        util.toast(res.msg || '处理授权失败')
        this.processAuthFail(res)
      }
    },
    // 处理授权成功
    processAuthSuc(wexUserInfo, fb) {
      api.sendUserAuthInfoEx(wexUserInfo, ok => {
        this.notifyCaller(true, '处理授权成功')
        this.close()
      }, nk => {
        if (fb) {
          fb(nk)
        } else {
          this.processAuthFail(nk)
        }
      })
    },
    // 处理授权失败
    processAuthFail(err) {
      console.log('【授权组件】 处理授权失败: ', err)
      let errMsg = err.msg || '获取信息失败'
      let wxerr = err.wxerr || {}
      if (wxerr.errMsg === 'getUserInfo:fail auth deny') {
        util.toast('您已拒绝授权，很抱歉不能为您提供相关服务')
        this.close()
      }
      this.notifyCaller(false, errMsg)
    },
    // 通知回调者
    notifyCaller(ok, msg) {
      try {
        let fn = ok ? this.ctx.cb : this.ctx.fb
        fn && fn(msg)
      } catch (e) {
        console.log('【授权组件】 通知回调发生异常', e)
      }
    }
  }
}))