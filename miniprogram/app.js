const {mixin, util, conf} = require('/utils/mixin.js')

// app.js
App({
  globalData: {
    // 当前使用的tabarId
    tabarId: '',
    // 用户信息
    user: {
      id: '',
      name: '',
      avatar: '',
      mbl: ''
    },
    // 会话信息
    session: {
      token: ''
    },
    // tab页参数
    lastTabpageParams: null
  },
  onLaunch: function () {
    // 启动更新管理
    util.startUpdateManager()
    // 测试环境支持
    if (conf.isTestEnv()) {
      let lastPageCtx = util.unsave(conf.KEY_PAGE_CTX) || {}
      console.log('【测试支持】 自动跳转: ', lastPageCtx)
      if (lastPageCtx.path && lastPageCtx.path != '/pages/index/index') {
        util.navNext.timeout(1000, this)(lastPageCtx.path, lastPageCtx.options)
      }
    }
    // 
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-1g8f95pb1104ec9f',
        traceUser: true,
      });
    }

    this.globalData = {};
  }
});
