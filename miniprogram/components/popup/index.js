const { mixin, api, util, conf } = require('../../utils/mixin.js')

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },

  data: {
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
    },
    close() {
      this.setData({ show: false })
      this.data._cb = null
    },
    onMask() {
      this.data.ableMaskClick && this.close()
    }
  }
})