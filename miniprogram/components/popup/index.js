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
    maskNoBg: false,
    noCloseIco: false,
    title: '',
    _cb: null
  },

  methods: {
    open(params, cb) {
      params = params || {}
      this.setData({
        show: true,
        ableMaskClick: params.ableMaskClick === undefined ? true : params.ableMaskClick,
        maskNoBg: params.maskNoBg === undefined ? false : params.maskNoBg,
        noCloseIco: params.noCloseIco === undefined ? false : params.noCloseIco,
        title: params.title || ''
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