const { mixin, api, util, conf, isEqualList } = require('../../../../utils/mixin.js')

const nav = [
  { title: 'popup', ico: 'ico-popup', methods: 'open', params: { mask: true, maskClick: true, close: true }, cb: 'popCb' },
  { title: 'dialog', ico: 'ico-dialog', methods: 'open', params: { type: 'dlg', title: '这是一个对话框', content: '这是一段文字' }, cb: 'dlgCb', fb: 'dlgFb' },
  { title: 'pick-time', ico: 'ico-time', methods: 'open', params: {}, cb: 'pickCb' },
  { title: 'plate-keybod', ico: 'ico-k-plate', methods: 'open', params: {} },
  { title: 'num-keybod', ico: 'ico-k-num', methods: 'open', params: { type: 'dot' }, cb: 'numCb' },
  { title: 'calc-keybod', ico: 'ico-k-calc', methods: 'open', params: { str: 1000 }, cb: 'calcCb' },
  { title: 'cpns', ico: 'ico-cpns', methods: 'open', params: {} }
  { title: 'mbl-valid', ico: 'ico-phone', methods: 'open', params: {} },
  // { title: 'user-auth', ico: 'ico-auth', methods: 'open', params: {} },
]

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    tabbar: {
      type: String,
      value: 'admin'
    }
  },
  lastshowtime: 0,
  data: {
    nav,
    user: {},
    list: [],
    imgs: []
  },
  methods: {
    setUser(user) {
    },
    popCb() {
      console.log('关闭了popup')
    },
    dlgCb() {
      console.log('点击了确定')
    },
    dlgFb() {
      console.log('点击了取消')
    },
    pickCb(time) {
      util.toast(time)
    },
    numCb(num) {
      util.toast(num)
    },
    calcCb(num) {
      util.toast(num)
    },
    onNav(e) {
      let i = e.currentTarget.dataset.i
      let item = nav[i]
      let com = this.selectComponent('#' + item.title)
      com[item.methods](item.params, this[item.cb], this[item.fb])
    },
    onShow() {
      let time = Date.now()
      if (util.isTimeoutSecs(15, time, this.lastshowtime)) {
        this.lastshowtime = time
        // this.getList()
      }
    }
  },
  ready() {
    this.lastshowtime = Date.now()
  }
}))
