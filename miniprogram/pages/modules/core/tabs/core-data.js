const { mixin, api, util, conf } = require('../../../../utils/mixin.js')
const db = wx.cloud.database()
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
    list: []
  },
  methods: {
    getList() {
      db.collection('contacts').get().then(res => {
        let list = res.data || []
        list = this.addCat(list).groupBy('cat')
        let abc = this.fetchABC(list)
        this.setData({ list, abc })
      })
    },
    addCat(list) {
      list = list || []
      list.forEach(item => {
        item.cat = item.name.substring(0, 1)
      })
      return list
    },
    fetchABC(list) {
      list = list || []
      return list.fetch('name')
    },
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
    onItem(e) {
      let [index, idx] = e.currentTarget.dataset.i.split('_')
      let item = this.data.list[index].subs[idx]
      this.setData({ item })
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
    this.getList()
    let self = this
    wx.createSelectorQuery()
      .in(this) // 页面中不需要，组件内需指定
      .selectAll('.wrap-index .index')
      .boundingClientRect()
      .exec(function (res) {
        let indexPos = res[0]
        self.setData({ indexPos })
      })
  }
}))