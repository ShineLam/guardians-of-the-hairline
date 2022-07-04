const { mixin, api, util, conf, isEqualList } = require('../../../../utils/mixin.js')

Page(mixin.page({
  data: {
    url: ''
  },
  onLoad(opts) {
    let url = decodeURIComponent(opts.url) || ''
    this.setData({ url })
  }
}))