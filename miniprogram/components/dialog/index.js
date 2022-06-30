const {mixin, api, util, conf} = require('../../utils/mixin.js')

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },
  data: {
    show: false,
    maskClick: true,
    close: false,
    type: '', // 确认框: cfm, 对话框: dlg, 弹窗: ''
    title: '',
    cnlTxt: '取消',
    cfmTxt: '确定',
    content: '',
    zIndex: 0,
    _cb: null,
    _fb: null
  },
  methods: {
    open(params, cb, fb) {
      this.setData({
        show: true,
        title: params && (params.title || ''),
        content: params && (params.content || ''),
        cnlTxt: params && (params.cnlTxt || '取消'),
        cfmTxt: params && (params.cfmTxt || '确定'),
        close: params && (util.isEmpty(params.close) ? false : params.close),
        type: params && (util.isEmpty(params.type) ? '' : params.type),
        maskClick: params && (util.isEmpty(params.maskClick) ? true : params.maskClick),
        zIndex: params && (params.zIndex || 0)
      })
      this.data._cb = cb || null
      this.data._fb = fb
    },
    close() {
      this.setData({
        show: false
      })
    },
    onMask() {
      if (this.data.maskClick) {
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
