const { mixin, api, util, conf } = require('../../../../utils/mixin.js')


Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {},
  lastshowtime: 0,
  data: {
  },
  methods: {
    setUser(user) {

    },
    onShow() {
      let time = Date.now()
      if (util.isTimeoutSecs(3 * 60, time, this.lastshowtime)) {
        this.lastshowtime = time
        // this.getList()
      }
    }
  },
  ready() {
    this.lastshowtime = Date.now()
  }
}))