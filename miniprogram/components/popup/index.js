const { mixin, api, util, conf } = require('../../utils/mixin.js')

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },

  data: {
    safeBtm: 0,
    show: false,
    ableMaskClick: true,
    nobg: false,
    noCloseIco: true,
    title: '',
    zIndex: 0,
    _cb: null
  },

  methods: {
    open(params, cb) {
      params = params || {}
      this.setData({
        show: true,
        ableMaskClick: params.ableMaskClick === undefined ? true : params.ableMaskClick,
        nobg: params.nobg === undefined ? false : params.nobg,
        noCloseIco: params.noCloseIco === undefined ? true : params.noCloseIco,
        title: params.title || '',
        zIndex: params && ((params.zIndex - 0) || 0)
      })
      this.data._cb = cb
      console.log(util.isNull(this.getTabBar()))
      !util.isNull(this.getTabBar()) && this.setSafebtm()
    },
    close() {
      this.setData({ show: false })
      this.data._cb = null
    },
    onMask() {
      this.data.ableMaskClick && this.close()
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