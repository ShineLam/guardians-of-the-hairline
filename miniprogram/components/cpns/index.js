const { mixin, api, util, conf } = require('../../utils/mixin.js')
const nav = ['代金券']
const scopes = [0, '所有适用(无要求)', 1, '普通会员适用', 2, '铂钻会员适用', 3, '蓝钻会员适用', 4, '皇冠会员适用', 10, '单品服务项目适用', 11, '组包服务项目适用', 12, '洗车服务项目适用', 13, '贴膜服务项目适用', 14, '保养服务项目适用', 15, '改装服务项目适用', 16, '美容服务项目适用', 17, '车衣服务项目适用', 18, '隐形车衣项目适用', 19, '改色膜项目适用', 39, '其他服务项目适用']

Component(mixin.component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },
  data: {
    nav,
    query: {
      del_: 0,
      stats: 1, // 0: 待领取; 1: 待使用; 7: 已失效; 8: 已过期; 9: 已使用
      pageSize: 10,
      pageNum: 1,
      obyCtime: 2,
      type: 1
    },
    list: [],
    ids: [],
    payAmt: '',
    srvordId: '',
    _cb: null
  },
  methods: {
    open(params, cb) {
      params = params || {}
      this.data.payAmt = params.payAmt || ''
      this.data.srvordId = params.srvordId || ''
      this.dialog.open({ btnGroup: false })
      this.data._cb = cb || null
      this.getList()
    },
    getList() {
      api.getPt4sCouponList.loadPageData(this, this.data.query, (rst, list) => {
        list.forEach(cpn => this.mapCpn(cpn))
      })
    },
    mapCpn(cpn) {
      cpn.chked = false
    },
    // 查找优惠券/优惠券对应信息
    findCpns(key) {
      let list = this.data.list
      let ids = util.isArray(this.data.ids) ? this.data.ids : [this.data.ids]
      let cpn = []
      ids.forEach(id => {
        let item = list[list.findIndex(itm => itm.id == id)]
        item && cpn.push(key ? item[key] : item)
      })
      return cpn
    },
    // 所选券总额(代金券累加券金额)
    total() {
      if (this.data.query.type === 1) {
        let amts = this.findCpns('amt')
        return amts.length && amts.reduce((pre, cur) => { return (pre - 0) + (cur - 0) })
      } else if (this.data.query.type === 2) { // 折扣
        let priceDes = this.findCpns('priceDes')
        return parseInt(priceDes) / 100
      } else {
        let title = this.findCpns('title')
        return title.join('')
      }
    },
    // 消费门槛(找出所有券中最高的消费门槛金额)
    thred() {
      let thred = this.findCpns('thred')
      return thred.length ? Math.max.apply(null, thred) : 0
    },
    // 所选券id
    cpnIds() {
      let cpnids = this.findCpns('id')
      return cpnids.length ? cpnids.join(',') : ''
    },
    precheckPt4sSrvord(cb) {
      api.precheckPt4sSrvord({
        id: this.data.srvordId,
        coupon_ids: this.cpnIds()
      }, rst => {
        rst = rst.data || {}
        if (rst.invalidQty === 0) {
          cb && cb()
        } else {
          util.toast(rst.firstInvalidTips)
        }
      })
    },
    chk(cb) {
      let data = this.data
      if (!data.ids.length) {
        this.onCnl()
        return
      }
      if (util.isArray(data.ids) && data.ids.length > 6) {
        util.toast('最多只能使用6张优惠券')
      } else if ((data.payAmt - 0) < (this.thred() - 0)) {
        util.toast('订单金额未满' + util.fentoyuan(this.thred()) + '元, 暂不能使用')
      } else if (data.query.type === 1 && (data.payAmt - 0) < (this.total() - 0)) {
        util.toast('优惠券金额不能大于订单金额')
      } else {
        this.precheckPt4sSrvord(cb)
      }
      console.log('【优惠券相关信息】', '传入订单支付金额：' + data.payAmt, '所选优惠券总额： ' + this.total(), '消费门槛： ' + this.thred())
    },
    reload() {
      this.data.query.pageNum = 1
      this.data.list = []
      this.getList()
    },
    onCfm() {
      this.chk(() => {
        if (this.data._cb) {
          var list = this.findCpns()
          this.data._cb({ ids: this.cpnIds(), total: this.total(), type: this.data.query.type, list: list })
          this.data._cb = null
        }
        this.dialog.close()
      })
    },
    onCnl() {
      if (this.data._cb) {
        this.data._cb({ ids: '', type: '', total: '0.00', list: [] })
        this.data._cb = null
      }
      this.onClr()
      this.dialog.close()
    },
    onClr() {
      let ids = []
      let list = this.data.list
      list.forEach(item => {
        item.chked = false
      })
      this.setData({ list, ids })
    },
    onInput(e) {
      let value = e.detail.value
      let param = e.currentTarget.dataset.p
      this.setData({
        [param]: value
      })
    },
    onBtm() {
      ++this.data.query.pageNum
      this.getList()
    }
  },
  ready() {
    this.dialog = this.selectComponent("#dialog")
  }
}))