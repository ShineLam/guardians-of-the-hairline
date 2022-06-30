const {mixin, api, util, conf} = require('../utils/mixin.js')

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    tabarId: {
      type: String,
      value: ''
    }
  },
  data: {
    selected: 0,
    color:  "#221F1F",
    selectedColor: "#CC2B22",
    list: conf.getAppTabarItems()
  },
  lifetimes: {
    attached: function() {
      let tabarId = this.getCurTabarId()
      console.log('【CustomTabbar】 tabbar attached: ', tabarId)
      this.switchTabbar(tabarId)
    }
  },
  methods: {
    // 点击tab
    onTab (e) {
      const index = e.currentTarget.dataset.index
      let item = this.data.list[index]
      let url = item.pagePath && this.fixPath(item.pagePath)
      let tabarId = this.getCurTabarId()
      console.log('【CustomTabbar】 tabbar clicked: ', tabarId, index, url, item)
      this.setData({selected: index})
      wx.switchTab({ url })
    },

    // 获取当前菜单栏ID
    getCurTabarId () {
      return this.properties.tabarId || conf.getTabarId()
    },

    // 切换tab栏
    switchTabbar (tabarId, tabpage) {
      let items = conf.getTabarItems(tabarId)
      console.log('【CustomTabbar】 switch tabbar: ', tabarId, tabpage, items)
      this.setTabbarItems(items)
    },
    // 使用菜单项
    setTabbarItems (items) {
      if (items && items.length) {
        let list = this.data.list
        list.forEach((tab, i) => {
          let item = items[i] || { show: false }
          tab.show = (item.show || util.isNull(item.show))
          tab.text = item.text || tab.text
          tab.iconPath = item.iconPath || tab.iconPath
          tab.selectedIconPath = item.selectedIconPath || tab.selectedIconPath
        })
        this.setData({ list })
      }
    },

    // 修正路径
    fixPath (path) {
      return path.charAt(0) === '/' ? path : ('/' + path)
    },

    // 获取当前tab项下标
    getTabPageIndex (def) {
      let pages = getCurrentPages()
      let paths = this.data.list
      if (pages.length) {
        for (let i = 0, curPage = pages[0]; i < paths.length; i++) {
          if (paths[i].pagePath === curPage.route) {
            return i
          }
        }
      }
      return def || -1
    },

    // 设置选中状态
    setSelected (defIndex) {
      let index = util.isNull(defIndex) ? this.getTabPageIndex(0) : defIndex
      let tabarId = this.getCurTabarId()
      let items = conf.getTabarItems(tabarId)
      console.log('【CustomTabbar】 tabbar selected: ', tabarId, index)
      this.setTabbarItems(items)
      this.setData({ selected: index })
    },

    // 设置tab项信息
    setTabitem (item, index) {
      index = util.isNull(index) ? this.getTabPageIndex(0) : index
      let tabitem = this.data.list[index]
      if (tabitem) {
        tabitem.text = item.text || tab.text
        tabitem.iconPath = item.iconPath || tab.iconPath
        tabitem.selectedIconPath = item.selectedIconPath || tab.selectedIconPath
        //
        conf.setTabarId(id || '')
        this.setData({
          list: this.data.list
        })
      }
    }
  }
})
