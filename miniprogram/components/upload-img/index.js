const { mixin, api, util, conf } = require('../../utils/mixin.js')

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    auto: {
      type: 'Boolean',
      value: false
    },
    imgs: {
      type: 'Array',
      value: []
    }
  },
  data: {
    path: [], // 本地路径
    uri: '', // 已上传地址
    upded: []
  },
  ready() {
    this.preview = this.selectComponent("#preview")
  },
  methods: {
    // 设置图片路径
    setPath(path) {
      this.setData({ path })
      // 自动上传
      if (this.properties.auto) {
        this.doUpload()
      }
    },

    doUpload(cb) {
      let path = this.data.path
      path.oneByOne((img, next) => {
        wx.showLoading({
          title: '上传中',
          mask: true
        })
        if (img) {
          api.upload(img, data => {
            this.uploadSuc(data)
            next()
          }, err => {
            wx.hideLoading()
          })
        }
      }, () => {
        let upded = this.data.upded
        wx.hideLoading()
        cb && cb(upded)
        this.triggerEvent('setImg', upded)
        console.log('全部上传完成', upded)
      })
    },

    uploadSuc(data) {
      console.log('【上传成功】', data)
      let upded = this.data.upded
      upded.push(this.prefixLocation(data.Location))
      this.setData({ upded })
    },

    prefixLocation(url) {
      return url.indexOf('://') == -1 ? 'https://' + url : url
    },

    // 选择照片相关操作
    _onImg(e) {
      let { p, i } = e.currentTarget.dataset
      let path = p == 'img' ? this.properties.imgs : this.data.path
      this.preview.open(path, i)
    },
    _onChoose() {
      this.chooseMedia()
    },

    // 删除图片
    _onDel(e) {
      let i = e.currentTarget.dataset.i
      let path = this.data.path
      path.splice(i, 1)
      this.setPath(path)
    },

    chooseMedia() {
      let path = this.data.path
      util.chooseMedia(imgs => {
        path = [...imgs, ...path]
        this.setPath(path)
      })
    }
  }
}))