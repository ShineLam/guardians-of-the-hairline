const { mixin, api, util, conf } = require('../../utils/mixin.js')

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },

  data: {
    show: false,
    maskClick: true, // 遮罩允许点击
    mask: true, // 是否有遮罩
    close: true, // 是否有关闭按钮
    zIndex: 0, // 层级
    safeBtm: 0
  },

  methods: {
    open(params) {
      params = params || {}
      this.setData({
        show: true,
        maskClick: util.isEmpty(params?.maskClick) ? true : params.maskClick,
        mask: util.isEmpty(params?.mask) ? true : params.mask,
        close: util.isEmpty(params?.close) ? true : params.close,
        zIndex: (params?.zIndex - 0) || 0
      })
      !util.isNull(this.getTabBar()) && this.setSafebtm()
    },
    close() {
      this.setData({ show: false })
    },
    onMask() {
      this.data.maskClick && this.close()
    },
    setSafebtm() {
      let self = this
      wx.getSystemInfo({
        success(res) {
          let { screenHeight, safeArea: { bottom } } = res
          if (screenHeight && bottom) {
            let safeBtm = 48 + (screenHeight - bottom)
            self.setData({ safeBtm })
          }
        }
      })
    }
  }
})