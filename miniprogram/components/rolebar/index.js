/**
 * 此组件只为了展示多角色入口
 * 方便切换身份
 * 可随时删除
 */

const { mixin, api, util, conf } = require('../../utils/mixin.js')
const nav = [{name: '首页', id: 'index'}, {name: '用户端', id: 'core'}, {name: '管理员', id: 'admin'}]

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },

  data: {
    show: conf.isTestEnv(),
    showSidebar: false,
    nav: nav
  },

  methods: {
    toggle(elem) {
      let elm = this.data[elem]
      this.setData({
        [elem]: !elm
      })
    },
    onDrawer() {
      this.toggle('showSidebar')
    },
    onNav(e) {
      let i = e.currentTarget.dataset.i
      let itm = this.data.nav[i]
      itm.id == 'index' ? util.navNext('/pages/index/index') : util.navNext('tab-home', { tabarId: itm.id })
      this.toggle('showSidebar')
    },
    onSuper () {
      util.navNext('super-home-index')
    }
  }
})
