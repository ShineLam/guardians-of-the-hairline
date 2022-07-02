const { mixin, api, util, conf } = require('../../utils/mixin.js')

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    past: true, // 可选过去时间(暂未实现)
    years: [],
    months: [],
    days: [],
    hours: [],
    minutes: [],
    value: [], // picker-view-column对应的下标
    _cb: null
  },
  methods: {
    open(params, cb) {
      this.setData({
        past: util.isEmpty(params?.past) ? true : params.past
      })
      this.data._cb = cb || null
      this.init()
      this.popup.open({ close: false })
    },
    close() {
      this.popup.close()
    },
    initYears() {
      let years = []
      let year = new Date()
      year.setFullYear(year.getFullYear() - 5)
      for (let i = 0; i < 10; i++) {
        years.push(year.getFullYear())
        year.setFullYear(year.getFullYear() + 1)
      }
      return years
    },
    initDays(year, month) {
      let m = month - 1
      let date = new Date(year, m, 1)
      let days = []
      while (date.getMonth() === m) {
        days.push(this.fmtValue(date.getDate()))
        date.setDate(date.getDate() + 1)
      }
      return days
    },
    select(date, years) {
      return [
        years.indexOf(date.getFullYear()),
        date.getMonth(),
        date.getDate() - 1,
        date.getHours(),
        date.getMinutes()
      ]
    },
    init() {
      let today = new Date()
      let years = this.initYears()
      let months = util.fromto(1, 12)
      let days = this.initDays(today.getFullYear(), today.getMonth() + 1)
      let hours = util.fromto(0, 23, true)
      let minutes = util.fromto(0, 59, true)
      let value = this.select(today, years)
      this.setData({
        years,
        months,
        days,
        hours,
        minutes
      })
      this.setData({
        value
      })
    },
    fmtValue(value) {
      if (util.isEmpty(value)) {
        return ''
      } else {
        value = (value - 0)
        return value < 10 ? '0' + value : value
      }
    },
    getValue() {
      // index => value
      let val = this.data.value
      let year = this.fmtValue(this.data.years[val[0]])
      let month = this.fmtValue(this.data.months[val[1]])
      let day = this.fmtValue(this.data.days[val[2]])
      let hour = this.fmtValue(this.data.hours[val[3]])
      let minute = this.fmtValue(this.data.minutes[val[4]])
      return `${year}-${month}-${day} ${hour}:${minute}`
    },
    onChange(e) {
      const value = e.detail.value
      let year = this.data.years[value[0]]
      let midx = value[1]
      let didx = value[2]
      console.log('onChange', year, midx + 1, value)
      let days = this.initDays(year, midx + 1)
      if (days[days.length - 1] != this.data.days[this.data.days.length]) {
        this.setData({
          days
        })
        if (didx >= days.length) {
          value[2] = days.length - 1
        }
      }
      this.setData({
        value
      })
    },
    onEnded() {
      
    },
    onCnl() {
      this.close()
    },
    onCfm() {
      this.data._cb(this.getValue())
      this.data._cb = null
      this.close()
    }
  },
  ready() {
    this.popup = this.selectComponent("#popup")
  }
}))