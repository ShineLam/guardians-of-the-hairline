const { mixin, api, util, conf, isEqualList } = require('../../../../utils/mixin.js')

Page(mixin.page({
  data: {
    stats: 0,
    query: {},
    list: []
  },
  setUser (user) {
    
  },
  getQuery (cb) {
    let qry = this.data.query
    if (!qry) {

    } else {
      qry.stats = this.data.stats
    }
    cb && cb(qry)
  },
  getList() {
    this.getQuery(qry => {
      api.getTcbtktbat1List.loadPageData(this, qry)
    })
  },
  // 判断list与加载的最新数据是否相同(防止过多加载以及页面闪抖)
  equalList (nlist, q) {
    return isEqualList(this.data.list, nlist, (v1, v2) => v1.id === v2.id && v1.updTime === v2.updTime)
  },

  onQuery(){
    this.reloadlist()
  },

  onLoad(opts) {
  },
  onShow() {
    // this.getList()
  },
  onReady() {
    this.dialog = this.selectComponent("#dialog")
    // this.reloadlist()
  }
}))