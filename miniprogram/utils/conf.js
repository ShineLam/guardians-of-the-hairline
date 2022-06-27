// HOST
const API_HOST = 'https://test.guardians.com'
const IMG_HOST = API_HOST

// 接口地址前缀
const API_URL_PREFIX = API_HOST 

// 应用别名
const APP_ALIAS = 'guardians'

// 开发测试环境
const testEnv = API_HOST.indexOf('://test') !== -1
const isTestEnv = () => {
  return testEnv
}

// Key定义-页面上下文本地存储KEY
const KEY_PAGE_CTX = 'PAGE_CTX'
const KEY_TABAR_ID = 'G_TABBAR_ID'
//
const PARAM_TABARID_NAME = 'tabarId'


// TabBar定义(应与app.json中定义的tabBar保持一致)
const APP_TAB_BAR = {
  custom: true, // 开启/关闭自定义tabbar
  list: [{
      "pagePath": "pages/tabs/home/tab-home",
      "iconPath": "/imgs/tab-home.png",
      "selectedIconPath": "/imgs/tab-home-act.png",
      "text": "首页",
      "color": '#939996',
      "selectedColor": '#2AA371'
    },
    {
      "pagePath": "pages/tabs/data/tab-data",
      "iconPath": "/imgs/tab-chart.png",
      "selectedIconPath": "/imgs/tab-chart-act.png",
      "text": "数据",
      "color": '#939996',
      "selectedColor": '#2AA371'
    },
    {
      "pagePath": "pages/tabs/profile/tab-profile",
      "iconPath": "/imgs/tab-my.png",
      "selectedIconPath": "/imgs/tab-my-act.png",
      "text": "设置",
      "color": '#939996',
      "selectedColor": '#2AA371'
    }
  ]
}

// TabBar定义.管理员
const TABS_core = [{
  text: '首页'
}, {
  text: '我的'
}]

// TabBar定义.路保/监管
const TABS_worker   = [{
  text: '首页'
}, {
  text: '我的'
}]

// 应用菜单
const TABS = {
  core: TABS_core,
  worker: TABS_worker,
}

// 获取全局数据
const getGlobal = (name) => {
  let data = getApp().globalData || {}
  return data[name]
}
// 设置全局数据
const setGlobal = (name, value) => {
  let data = getApp().globalData
  if (data) {
    data[name] = value
  }
  return value
}

// 获取当前tabarId
const getTabarId = (def) => {
  let tabarId = getGlobal(PARAM_TABARID_NAME)
  if (!tabarId) {
    tabarId = wx.getStorageSync(KEY_TABAR_ID)
    if (!tabarId) {
      getApp().globalData.tabarId = tabarId
    }
  }
  return tabarId || def
}

// 设置为当前tabarId
const setTabarId = (id) => {
  if (id in TABS) { // 必须定义的ID才允许设置
    setGlobal(PARAM_TABARID_NAME, id || '')
    wx.setStorage({key: KEY_TABAR_ID, data: id})
    return true
  } else {
    console.log('【应用配置】 tabarId未定义:', id)
    return false
  }
}

// 获取指定ID的bar
const getTabarItems = (tabarid) => {
  return TABS[tabarid || getTabarId()]
}

// 获取系统tabbar菜单项
const getAppTabarItems = () => {
  let list = []
  APP_TAB_BAR.list.forEach(e => {
    list.push(Object.assign({}, e))
  })
  return list
}

// 导出
module.exports = {
  API_HOST,
  IMG_HOST,
  API_URL_PREFIX,
  APP_ALIAS,
  isTestEnv,

  // KEYs
  KEY_PAGE_CTX,
  KEY_TABAR_ID,
  PARAM_TABARID_NAME,
  //
  APP_TAB_BAR,
  TABS,
  //
  getGlobal,
  setGlobal,
  getTabarId,
  setTabarId,
  getTabarItems,
  getAppTabarItems
}