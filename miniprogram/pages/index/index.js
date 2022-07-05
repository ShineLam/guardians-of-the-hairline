
const { mixin, api, util, conf } = require('../../utils/mixin.js')

Page(mixin.page({
  data: {

  },

  onLoad() {
    util.go('tab-home', { tabarId: 'core' })
  },
  onReady() {
  }
}))
