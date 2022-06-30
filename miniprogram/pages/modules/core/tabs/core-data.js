const { mixin, api, util, conf } = require('../../../../utils/mixin.js')
let timestamp = new Date().getTime()

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {},
  lastshowtime: 0,
  data: {
    show: false,
    flag: 'A',
    scrollIntoVw: '',
    indexPos: [],
    abc: [],
    brands: [
      {
        name: 'A', subs: [
          { name: '奥迪' },
          { name: '阿尔法·罗密欧' }
        ]
      }, {
        name: 'B', subs: [
          { name: '比亚迪' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: 'Brooke' }
        ]
      }, {
        name: 'C', subs: [
          { name: '奥迪' },
          { name: '奥迪' },
          { name: '奥迪' },
          { name: '奥迪' },
          { name: '奥迪' },
          { name: '奥迪' },
          { name: '奥迪' },
          { name: '阿尔法·罗密欧' }
        ]
      }, {
        name: 'D', subs: [
          { name: '比亚迪' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: 'Brooke' }
        ]
      }, {
        name: 'E', subs: [
          { name: '奥迪' },
          { name: '阿尔法·罗密欧' }
        ]
      }, {
        name: 'F', subs: [
          { name: '比亚迪' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: '宝马' },
          { name: '别克' },
          { name: 'Brooke' }
        ]
      },
    ],
    series: [
      {
        name: '一汽奥迪', subs: [
          { name: 'A3' },
          { name: 'A4' },
          { name: 'A4L' },
          { name: 'A6L' },
          { name: 'A8' },
          { name: 'Q3' },
          { name: 'Q5' },
          { name: 'S3' }
        ]
      }, {
        name: '进口奥迪', subs: [
          { name: 'A3' },
          { name: 'A4' },
          { name: 'A4L' },
          { name: 'A6L' },
          { name: 'A8' },
          { name: 'Q3' },
          { name: 'Q5' },
          { name: 'S3' },
          { name: 'S3' }
        ]
      },
    ]
  },
  methods: {
    initABC() {
      const CHARCODE_A = 'A'.charCodeAt(0)
      let abc = new Array(26).fill(null).map((v, i) => String.fromCharCode(CHARCODE_A + i))
      this.setData({ abc })
    },
    touchmove(e) {
      // 节流
      let now = new Date().getTime()
      if (now - timestamp < 50) return
      timestamp = now

      // 双指/多指/误触
      if (e.touches.length > 1) return

      // 判断滑动位置在元素top和bottom之间
      let y = e.touches[0].clientY
      let indexPos = this.data.indexPos
      for (const item of indexPos) {
        if (y >= item.top && y <= item.bottom) {
          this.scroll2Vw(item.dataset.id)
          break
        }
      }
    },
    scroll2Vw(id) {
      this.setData({
        scrollIntoVw: id,
        flag: id
      })
    },
    onIndex(e) {
      let id = e.currentTarget.dataset.id
      this.scroll2Vw(id)
    },
    onBrand(e) {
      let [index, idx] = e.currentTarget.dataset.i.split('_')
      let item = this.data.brands[index].subs[idx]
      console.log(item)
      this.showSide()
    },
    onSeries(e) {
      let [index, idx] = e.currentTarget.dataset.i.split('_')
      let item = this.data.series[index].subs[idx]
      console.log(item)
      util.navNext('core-car-cat')
      this.hideSide()
    },
    showSide() {
      this.setData({ show: true })
    },
    hideSide() {
      this.setData({ show: false })
    },
  },
  ready() {
    this.initABC()
    let self = this
    wx.createSelectorQuery()
      .in(this) // 页面中不需要，组件内需指定
      .selectAll('.wrap-index .index')
      .boundingClientRect()
      .exec(function (res) {
        console.log(res)
        let indexPos = res[0]
        self.setData({ indexPos })
      })
  }
}))