const { mixin, api, util, conf } = require('../../utils/mixin.js')

const numArr = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },
  data: {
    type: '', // 小数点: dot
    str: '',
    max: 8,
    _cb: null,
    numArr: numArr
  },
  methods: {
    open(params, cb) {
      this.setData({
        type: params && params.type || '',
        max: params && params.max || 8,
        str: params && params.str || ''
      })
      this.data._cb = cb || null
      this.setNumArr(params)
      this.popup.open({maskmask: true})
    },
    close() {
      this.popup.close()
    },
    // 弹出框点击
    onPopuptap(e) {
      this.close()
    },
    setNumArr(params) {
      let numArr = this.data.numArr
      let type = params && params.type || ''
      if (type.indexOf('dot') != -1 && numArr.indexOf('.') == -1) {
        numArr.push('.')
        this.setData({
          numArr: numArr
        })
      }
    },
    inpValid(val, cb) {
      let str = this.data.str || ''
      let list = str.split('.') || []
      if (val == '.' && !str) {
        console.warn("输入框为空，不能输入'.'")
      } else if (val == '.' && str.indexOf('.') != -1) {
        console.warn("输入框内容已含有'.'，不能再输入'.'")
      } else if (val != -1 && typeof list[1] !== 'undefined' && list[1].length > 1) {
        console.warn("小数点已有后两位，则不能输入")
      } else if (val != -1 && !isNaN(val) && str == '0') {
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
      })
    },
  },
  ready() {
    this.popup = this.selectComponent("#popup")
  }
}))