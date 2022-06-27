const {mixin, api, util, conf, isEqualList} = require('../../../../utils/mixin.js')

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
    user: {},
    list: []
  },
  methods: {
    setUser(user) {
    },
    onShow () {
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
