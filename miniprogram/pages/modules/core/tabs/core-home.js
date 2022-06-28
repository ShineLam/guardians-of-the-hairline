const { mixin, api, util, conf, isEqualList } = require('../../../../utils/mixin.js')
const nav = ['popup', 'dialog', 'preview', 'pick-time', 'plate-keybod', 'num-keybod', 'calc-keybod', 'mbl-valid', 'user-auth', 'cpns', 'upload-img']

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
      let com = this.selectComponent('#' + item)
      com.open()
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
