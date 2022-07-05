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
      if (!util.isEmpty(urls)) {
        urls = this.mapUrls(urls)
        wx.previewImage({ urls, current, showmenu: true })
      } else {
        util.toast('请传入预览的图片')
      }
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