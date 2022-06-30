const { mixin, api, util, conf, isEqualList } = require('../../../../utils/mixin.js')
const nav = [
  { title: 'popup', ico: 'ico-popup', methods: 'open', params: {} },
  { title: 'dialog', ico: 'ico-dialog', methods: 'open', params: {} },
  { title: 'preview', ico: 'ico-preview', methods: 'open', params: {} },
  { title: 'pick-time', ico: 'ico-time', methods: 'open', params: {} },
  { title: 'plate-keybod', ico: 'ico-k-plate', methods: 'open', params: {} },
  { title: 'num-keybod', ico: 'ico-k-num', methods: 'open', params: {} },
  { title: 'calc-keybod', ico: 'ico-k-calc', methods: 'open', params: {} },
  { title: 'mbl-valid', ico: 'ico-phone', methods: 'open', params: {} },
  { title: 'user-auth', ico: 'ico-auth', methods: 'open', params: {} },
  { title: 'cpns', ico: 'ico-cpns', methods: 'open', params: {} },
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
    list: []
  },
  methods: {
    setUser(user) {
    },
    onNav(e) {
      let i = e.currentTarget.dataset.i
      let item = nav[i]
      let com = this.selectComponent('#' + item.title)
      com[item.methods](item.params)
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
