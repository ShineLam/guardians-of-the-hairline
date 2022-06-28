const { mixin, api, util, conf } = require('../../utils/mixin.js')

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },

  data: {},

  methods: {
    open(urls, current) {
      urls = this.mapUrls(urls)
      current = urls[current]
      wx.previewImage({ urls, current })
    },
    mapUrls(urls) {
      urls = util.isArray(urls) ? urls : [urls]
      let newurls = urls.map(url => {
        return url = this.prefix(url)
      })
      return newurls
    },
    prefix(url) {
      return url.indexOf('://') == -1 ? 'https://' + url : url
    }
  }
}))