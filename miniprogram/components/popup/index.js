const { mixin, api, util, conf } = require('../../utils/mixin.js')

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },

  data: {
    show: false,
    maskClick: true,
    mask: true,
    close: true,
    title: '',
    zIndex: 0,
    safeBtm: 0,
    _cb: null
  },

  methods: {
    open(params, cb) {
      params = params || {}
      this.setData({
        show: true,
        maskClick: util.isEmpty(params?.maskClick) ? true : params.maskClick,
        mask: util.isEmpty(params?.mask) ? true : params.mask,
        close: util.isEmpty(params?.close) ? true : params.close,
        title: params?.title || '',
        zIndex: (params?.zIndex - 0) || 0
      })
      this.data._cb = cb || null
      !util.isNull(this.getTabBar()) && this.setSafebtm()
    },
    close() {
      this.setData({ show: false })
      this.data._cb = null
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