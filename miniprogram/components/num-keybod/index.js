const { mixin, api, util, conf } = require('../../utils/mixin.js')

const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },
  data: {
    nums,
    type: '', // 小数点: dot
    str: '',
    max: 8,
    _cb: null,
  },
  methods: {
    open(params, cb) {
      this.setData({
        type: params?.type || '',
        max: params?.max || 8,
        str: params?.str || ''
      })
      this.data._cb = cb || null
      this.initNums(params)
      this.popup.open()
    },
    close() {
      this.popup.close()
    },
    initNums(params) {
      let nums = this.data.nums
      let type = params?.type || ''
      if (type === 'dot' && nums.indexOf('.') === -1) {
        nums.splice(nums.length - 1, 0, '.')
        this.setData({ nums })
      }
    },
    inpValid(val, cb) {
      let str = this.data.str || ''
      let list = str.split('.') || []
      if (val == '.' && !str) {
        console.warn("输入框为空，不能输入'.'")
      } else if (val == '.' && str.indexOf('.') != -1) {
        console.warn("输入框内容已含有'.'，不能再输入'.'")
      } else if (val !== 'c' && typeof list[1] !== 'undefined' && list[1].length > 1) {
        console.warn("小数点已有后两位，则不能输入")
      } else if (val !== 'c' && !isNaN(val) && str == '0') {
        console.warn("已输入0，则不能再连续输入数字，只能输入'.'小数点")
      } else {
        cb && cb()
      }
    },
    _onKey(e) {
      let str = this.data.str
      let max = this.data.max
      let i = e.currentTarget.dataset.i
      this.inpValid(i, () => {
        if (i == 'c') {
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
      })
    },
  },
  ready() {
    this.popup = this.selectComponent("#popup")
  }
}))