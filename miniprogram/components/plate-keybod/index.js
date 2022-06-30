const { mixin, api, util, conf } = require('../../utils/mixin.js')

const numArr = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const lettArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '学', '港', '澳']
const provArr = ['京', '津', '冀', '晋', '蒙', '辽', '吉', '黑', '沪', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '桂', '琼', '川', '贵', '云', '渝', '藏', '陕', '甘', '青', '宁', '新']

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },
  data: {
    numArr,
    lettArr,
    provArr,
    str: '',
    max: 8,
    _cb: null
  },
  methods: {
    open(params, cb) {
      this.setData({
        max: params && params.max || 8,
        str: params && params.str || ''
      })
      this.popup.open({mask: true})
      this.data._cb = cb || null
    },
    close() {
      this.popup.close()
    },
    // 弹出框点击
    onPopuptap(e) {
      this.close()
    },
    _onKey(e) {
      let str = this.data.str
      let max = this.data.max
      let i = e.currentTarget.dataset.i
      if (i == '-1') {
        this.setData({
          str: str.substr(0, str.length - 1)
        })
        str = this.data.str
      } else if (str.length < max) {
        this.setData({
          str: str + i
        })
        str = this.data.str
      }
      this.data._cb(str)
    },
  },
  ready() {
    this.popup = this.selectComponent("#popup")
  }
}))