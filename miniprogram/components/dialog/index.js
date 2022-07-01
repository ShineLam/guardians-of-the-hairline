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
    title: '', // 标题
    cnlTxt: '取消', // 取消按钮文字
    cfmTxt: '确定', // 确定按钮文字
    content: '', // 文本内容
    zIndex: 0, // 层级
    _cb: null,
    _fb: null
  },
  methods: {
    open(params, cb, fb) {
      this.setData({
        show: true,
        title: params?.title || '',
        content: params?.content || '',
        cnlTxt: params?.cnlTxt || '取消',
        cfmTxt: params?.cfmTxt || '确定',
        close: util.isEmpty(params?.close) ? false : params.close,
        type: util.isEmpty(params?.type) ? '' : params.type,
        maskClick: util.isEmpty(params.maskClick) ? true : params.maskClick,
        zIndex: (params?.zIndex - 0) || 0
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
      if (this.data._cb) {
        this.data._cb()
        this.data._cb = null
      }
      this.close()
    },
    _onCnl() {
      if (this.data._fb) {
        this.data._fb()
        this.data._fb = null
      }
      this.close()
    }
  }
}))
