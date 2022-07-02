const { mixin, api, util, conf } = require('../../utils/mixin.js')

const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0']
// 计算表达式
const expressions = []
// 小数精度，默认2位有效小数
const PRECISION = 2

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {},
  data: {
    nums,
    title: '',
    orgStr: '',
    tipslen: 0,
    tips: '',
    result: '',
    _cb: null
  },
  methods: {
    // 打开组件
    open(params, cb) {
      let str = util.isNull(params.str) ? '' : this.trim0(params.str.toString().trim())
      let zIndex = params?.zIndex || 0
      let mask = params?.mask || true
      this.setData({
        title: params?.title || '金额',
        orgStr: str
      })
      this.op_reset(str).op_show()
      this.data._cb = cb || null
      this.popup.open({ mask, zIndex })
    },
    // 关闭组件
    close() {
      this.popup.close()
    },
    // 是否为四则运算符
    isop(v) {
      return v && v.length === 1 && (v === '+' || v === '-' || v === '*' || v === '÷' || v === '/')
    },
    // 以元为单位格式化
    format(num) {
      num = util.isNull(num) ? '' : (typeof (num) === 'number' ? num.toFixed(PRECISION) : num.toString())
      if (num) {
        let i = num.indexOf('.')
        num = i === -1 ? num + '.00000000000'.substring(0, PRECISION + 1) : (num + '00000000000').substring(0, i + PRECISION + 1)
      }
      return num
    },
    // 去除尾0
    trim0(num) {
      num = util.isNull(num) ? '' : num.toString()
      let i = num.indexOf('.')
      while (i !== -1 && num.length > i) {
        let c = num.charAt(num.length - 1)
        if (c === '0' || c === '.') {
          num = num.substring(0, num.length - 1)
        } else {
          break
        }
      }
      return num
    },
    // 四则计算
    calc(num1, op, num2) {
      if (this.isop(op)) {
        let result = ''
        if (op === '+') {
          result = (num1 - 0) + (num2 - 0)
        } else if (op === '-') {
          result = num1 - num2
        } else if (op === '*') {
          result = num1 * num2
        } else if (op === '÷' || op === '/') {
          result = parseFloat(num2, 10) === 0.00 ? '' : (num1 / num2)
        }
        return typeof (result) === 'number' ? this.trim0(result.toFixed(11)) : result
      }
    },
    // 重置操作
    op_reset(init) {
      let num = util.isNull(init) ? '' : init.toString()
      expressions.splice(0)
      this.op_push(num).op_show()
      return this
    },
    // 计算表达式
    op_calc() {
      let r = expressions.length ? expressions[0] : ''
      for (let i = 1, len = expressions.length; i + 1 < len; i++) {
        r = this.calc(r, expressions[i], expressions[++i])
      }
      return r
    },
    // 显示结果
    op_show() {
      let tipslen = expressions.length
      let tips = tipslen <= 1 ? '' : expressions.join(' ')
      let result = this.op_calc()
      this.setData({
        tips,
        tipslen,
        result
      })
      return this
    },
    // 是否为空
    op_isEmpty() {
      return expressions.length === 0
    },
    // 是否为数
    op_lastIsNum() {
      let last = this.op_last()
      return last && !this.isop(last)
    },
    // 是否整数
    op_lastIsInt() {
      let last = this.op_last()
      return last && !this.isop(last) && last.indexOf('.') === -1
    },
    op_last() {
      return expressions.length === 0 ? '' : expressions[expressions.length - 1]
    },
    op_pop() {
      return expressions.length ? expressions.pop() : ''
    },
    // 添加表达式
    op_push(str, append) {
      if (str) {
        if (this.isop(str)) {
          if (this.op_lastIsNum()) {
            expressions.push(str)
          }
        } else if (str === '.') {
          if (this.op_lastIsInt()) {
            expressions[expressions.length - 1] = expressions[expressions.length - 1] + '.'
          }
        } else {
          if (append) {
            if (this.op_lastIsNum()) {
              let last = this.op_pop()
              str = last === '0' ? str : last + str
            }
            // 限制过长
            let i = str.indexOf('.')
            if (i > 0) {
              if (str.length - i - 1 > PRECISION) {
                str = str.substring(0, i + PRECISION + 1)
              }
            } else {
              if (str.length > 10) {
                str = str.substring(0, 10)
              }
            }
          }
          expressions.push(str)
        }
      }
      return this
    },
    // 抹零操作
    op_zero() {
      while (this.isop(this.op_last())) {
        this.op_pop()
      }
      if (this.op_lastIsNum()) {
        let res = this.op_calc().toString()
        let i = res.indexOf('.')
        if (i !== -1) {
          i = res.substring(i + 1)
          if (parseInt(i, 10) > 0) {
            this.op_push('-').op_push('0.' + i)
          }
        } else {
          let sub = 1
          for (let i = res.length - 1, c; i >= 1; i--) {
            c = res.charAt(i)
            sub *= (c === '0' ? 10 : c)
            if (c !== '0') {
              this.op_push('-').op_push(sub.toString())
              break
            }
          }
        }
      }
    },
    // 界面输入
    _onKey(e) {
      let v = e.currentTarget.dataset.v
      let n = e.currentTarget.dataset.n
      if (v === 'o') { // 抹零操作
        this.op_zero()
      } else if (v === 'r') { // 重置操作
        this.op_reset(this.data.orgStr)
      } else if (v === 'c') { // 单个回退
        let tail = this.op_pop()
        if (tail.length > 1) {
          this.op_push(tail.substring(0, tail.length - 1))
        }
      } else if (v === 'z') { // 常用折扣
        if (this.op_lastIsNum()) {
          this.op_push('*').op_push(n)
        }
      } else if (this.isop(v)) { // 四则运算
        this.op_push(v)
      } else if (v >= '0' && v <= '9') { // 操作数
        this.op_push(v, true)
      } else if (v === '.') { // 小数点
        this.op_push(v)
      } else if (v === '=') { // 计算结果
        this.op_reset(this.op_calc())
      } else if (v === 'e') { // 确认结果
        this.done()
      }
      this.op_show()
    },
    // 确定完成
    done() {
      // let result = this.format(this.data.result) // 方式1
      let result = this.format(this.op_calc())      // 方式2
      this.data._cb && this.data._cb(result)
      this.data._cb = null
      this.close()
    }
  },
  ready() {
    this.popup = this.selectComponent("#popup")
  }
}))