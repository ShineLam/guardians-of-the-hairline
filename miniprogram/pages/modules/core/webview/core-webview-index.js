const { mixin, api, util, conf, isEqualList } = require('../../../../utils/mixin.js')

Page(mixin.page({
  data: {
    url
  },
  onLoad(opts) {
    let url = opts.url || ''
    console.log(111111, opts)
    this.setData({ url })
  }
}))