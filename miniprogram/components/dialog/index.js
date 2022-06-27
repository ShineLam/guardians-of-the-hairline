const {mixin, api, util, conf} = require('../../utils/mixin.js')

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },
  data: {
    show: false,
    zIndex: 0,
    type: '', // 确认框: cfm, 对话框: dlg, 弹窗: ''
    ablClickMask: true,
    hasClsBtn: false,
    title: '',
    cnlTxt: '取消',
    cfmTxt: '确定',
    cnt: '',
    _cb: null,
    _fb: null
  },
  methods: {
    open(params, cb, fb) {
      this.setData({
        show: true,
        title: params && (params.title || ''),
        cnt: params && (params.cnt || ''),
        cnlTxt: params && (params.cnlTxt || '取消'),
        cfmTxt: params && (params.cfmTxt || '确定'),
        hasClsBtn: params && (params.hasClsBtn === undefined ? false : params.hasClsBtn),
        type: params && (params.type === undefined ? '' : params.type),
        ablClickMask: params && (params.ablClickMask === undefined ? true : params.ablClickMask),
        zIndex: params && (params.zIndex || 0)
      })
      this.data._cb = cb
      this.data._fb = fb
    },
    close() {
      this.setData({
        show: false
      })
    },
    onMaskHide() {
      if (this.data.ablClickMask) {
        this.close()
        this.triggerEvent('maskEvt')
      }
    },
    _onCfm() {
      console.log('点击确认')
      if (this.data._cb) {
        this.data._cb()
        this.data._cb = null
      }
      this.close()
    },
    _onCnl() {
      console.log('点击取消')
      if (this.data._fb) {
        this.data._fb()
        this.data._fb = null
      }
      this.close()
    }
  }
}))
