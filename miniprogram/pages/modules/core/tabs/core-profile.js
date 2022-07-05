const { mixin, api, util, conf } = require('../../../../utils/mixin.js')
const db = wx.cloud.database()

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {},
  data: {
    user: {},
    imgs: []
  },

  methods: {
    getList() {
      db.collection('imgs').get().then(res => {
        let imgs = res.data || []
        imgs = imgs.fetch('src')
        this.setData({ imgs })
      })
    },
    opnPreview(e) {
      let i = e.currentTarget.dataset.i
      let imgs = this.data.imgs
      this.preview.open(imgs, imgs[i])
    },
    on2webview(e) {
      let url = e.currentTarget.dataset.url
      util.go('core-webview-index', { url })
    }
  },
  ready() {
    this.preview = this.selectComponent('#preview')
    this.getList()
  }
}))