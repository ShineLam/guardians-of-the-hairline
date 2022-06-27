const { api, util, conf, ext } = require('./api.js')

// 混入方式
const mixinfn = function (obj, fname, newfn) {
  let rawfn = obj[fname]
  obj[fname] = (rawfn ? newfn.mixin(rawfn) : newfn)
}

// 可覆盖方法(newfn会替换原来的方法)
const overwritefn = function (obj, fname, newfn) {
  obj[fname] = newfn || obj[fname]
}

// 不可覆盖
const cannotOverwritefn = function (obj, fname, newfn) {
  obj[fname] = obj[fname] || newfn
}

// 调用或显示错误信息
const callOrShowerr = function (fb, err) {
  if (fb && typeof (fb) === 'function') {
    fb(err)
  } else {
    util.toast(util.isStr(err) ? err : (err.msg || '抱歉，服务出错啦'))
  }
}

// 判断页面数据是否相同
const isEqualPageData = function (ctx, res, query) {
  if (typeof (ctx.equalList) === 'function') {
    return ctx.equalList(res.data || [], query)
  } else if (typeof (ctx.isEqualItem) === 'function') {
    let list = res.data || []
    if (list.length) {
      for (let i = 0, len = list.length, v; v = list[i]; i++) {
        if (!ctx.isEqualItem(v, i, len, query)) {
          return false
        }
      }
      return true
    }
  }
}

// 判断两个列表是否相等
const isEqualList = util.isEqualList

// 重新加载list
const reloadlist = function (ctx, reset) {
  if ((typeof (ctx.getList) === 'function') && ctx.data && ('query' in ctx.data)) {
    if (reset && ('list' in ctx.data) && (typeof (ctx.setData) === 'function')) {
      ctx.setData({
        list: []
      })
    }
    ctx.data.query.pageNum = 1
    ctx.getList()
  }
}

// 重新加载列表中某一项
const reloadone = function (ctx, idx, relist) {
  let isloadOne = false
  let cbfn = typeof (relist) === 'function' ? relist : null
  if (typeof (ctx.getOne) === 'function' && ctx.data && ctx.data.list) {
    let i = typeof (idx) === 'number' ? idx : ctx.data[idx]
    let item = i !== '' && i !== null && i !== undefined && ctx.data.list[i]
    if (item) {
      isloadOne = true
      ctx.getOne(item, nOne => {
        if (!nOne) {
          reloadlist(ctx)
        } else if (nOne.del) {
          ctx.data.list.splice(i, 1)
          ctx.setData({
            list: ctx.data.list
          })
          cbfn && cbfn(nOne, item, i, idx)
        } else {
          ctx.setData({
            ['list[' + i + ']']: nOne
          })
        }
      })
    }
  }
  // 清除
  if (typeof (idx) === 'string' && (idx in ctx.data)) {
    ctx.data[idx] = ''
    ctx.setData({
      [idx]: ''
    })
  }
  // 列表加载
  if (relist && !isloadOne) {
    reloadlist(ctx)
  }
  return isloadOne
}

// 加载更多处理
const loadMoreData = function (ctx, more) {
  // console.log('【数据加载】', more ? '加载更多' : '刷新列表')
  // more: true: 上拉加载(下一页) ; false: 下拉刷新(第一页)
  let query = ctx.data.query
  if (query && typeof (ctx.getList) === 'function' && ('list' in ctx.data)) {
    query.pageNum = more ? (query.pageNum + 1) : 1
    ctx.setData({
      ['query.pageNum']: query.pageNum
    })
    ctx.getList()
    console.log('【数据加载】', more ? '加载更多' : '刷新列表', query.pageNum)
  }
}

// 添加分页处理能力
const addDataPagingAbility = function (ctx, defMethods) {
  ctx.data = ctx.data || {}
  // 数据正在加载标识(dataloading=0时表示未加载数据，dataloading >= 1 表示正在加载数据，数字值表示有多少个请求加载的任务)
  ctx.data.dataloading = 0
  // 控制页面显示'无数据', 表示一条数据都没有
  ctx.data.noData = !!ctx.data.noData
  // 控制页面显示'无更多数据了'，表示数据已经加载数据完毕，提示用户没有更多数据了
  ctx.data.noMore = !!ctx.data.noMore
  // 能力处理方法
  const methods = {
    setNoData(b, more) {
      this.setData({
        noData: !!b,
        noMore: b ? !!!b : ((more !== null && more !== undefined) ? !!more : this.data.noMore)
      })
    },
    setNoMore(b, data) {
      this.setData({
        noMore: !!b,
        noData: b ? !!!b : ((data !== null && data !== undefined) ? !!data : this.data.noData)
      })
    },
    getPageDataName(listName) {
      return listName || this.datalist || 'list'
    },
    setPageDataList(list, listName) {
      listName = this.getPageDataName(listName)
      this.setData({
        [listName]: list || []
      })
    },
    getPageDataList(listName) {
      return this.data[this.getPageDataName(listName)]
    },
    doCallFilterList(filerfn, list, qry, listNmae, oldList) {
      let rstList = list
      if (filerfn && typeof (filerfn) === 'function') {
        let rst = filerfn.call(this, list, qry, listNmae, oldList)
        if (rst && typeof (rst) !== 'string' && ('length' in rst)) {
          rstList = rst
        }
      }
      return rstList
    },
    doSetNoDataNoMore(loadDataCnt, pageNum) {
      if (loadDataCnt > 0) {
        // 有数据处理
        this.setNoData(false, false) // noData与noMore都不显示
      } else {
        // 无数据处理
        if (pageNum === 1) {
          // 第1页，没有数据则设置noData为true, 对于第1页noMore永远为false(即永不显示'无更多数据了')
          this.setNoData(true, false) // 显示noData, noMore不显示
        } else {
          // 第n页，没有数据则设置noMore为true, 对于第n页noData永远为false(即永不显示'暂无数据')
          this.setNoMore(true, false) // 显示noMore, noData不显示
        }
      }
    },
    filterPageList(query, res) {
      let listName = this.getPageDataName(query.__list)
      let pageDataList = query.pageNum === 1 ? [] : (this.getPageDataList(listName) || [])
      let list = (res.data || [])
      let loadCount = list.length
      //
      list = this.doCallFilterList(this.filterBefore, list, query, listName, pageDataList)
      if (list.length) {
        // 有数据处理
        if (pageDataList.length) {
          // 删除可能重复的页数据
          let start = (query.pageNum - 1) * (query.pageSize || 10)
          if (pageDataList.length > start) {
            pageDataList.splice(start, pageDataList.length - start)
          }
          // 使用遍历push方式可能更适合'加载更多'的情况
          // list.forEach(e => pageDataList.push(e))
          Array.prototype.push.apply(pageDataList, list)
        } else {
          pageDataList = list
        }
        // this.setPageDataList(pageDataList, listName)
        this.setNoData(false, false) // noData与noMore都不显示
      } else {
        // 无数据处理
        if (query.pageNum === 1) {
          pageDataList = []
          // 第1页，没有数据则设置noData为true, 对于第1页noMore永远为false(即永不显示'无更多数据了')
          this.setNoData(true, false) // 显示noData, noMore不显示
          // this.setPageDataList(pageDataList, listName)
        } else {
          // 第n页，没有数据则设置noMore为true, 对于第n页noData永远为false(即永不显示'暂无数据')
          this.setNoMore(true, false) // 显示noMore, noData不显示
        }
      }
      // 检查修复页码
      if (loadCount === 0 && query.pageNum > 1) {
        query.pageNum-- // 注意: 加载第n页没有数据，那么自动回退到上n-1页
      }
      // 过滤处理
      pageDataList = this.doCallFilterList(this.filterAfter, pageDataList, query, listName, list)
      // 更新页面
      this.setPageDataList(pageDataList, listName)
      // 返回新的数据列表
      return pageDataList
    }
  }

  // 添加处理能力
  for (let fname in methods) {
    cannotOverwritefn(defMethods, fname, methods[fname])
  }
}

// 添加用户授权能力
const addUserAuthAbility = function (ctx, defMethods) {
  // 能力处理方法
  const methods = {
    // 请求用户授权
    openUserAuth: function (opts, cb, fb) {
      console.log('【请求授权】 opts: ', opts)
      let userAuth = this.selectComponent('#userAuth')
      if (userAuth && typeof (userAuth.open) === 'function') {
        userAuth.open(opts, cb, fb)
      } else {
        let errcode = 'auth_fail'
        let errmsg = '授权失败'
        if (!userAuth) {
          errcode = 'not_found'
          errmsg = '未添加授权组件'
        } else if (!userAuth.open) {
          errcode = 'no_open'
          errmsg = '授权组件未提供打开方式'
        }
        fb && fb(errcode, errmsg) // 一定要执行(否则后续处理不能正常进行)
        util.toast(errmsg)
      }
    }
  }

  // 添加处理能力
  for (let fname in methods) {
    cannotOverwritefn(defMethods, fname, methods[fname])
  }
}

// 添加手机验证处理能力
const addMblValidAbility = function (ctx, defMethods) {
  // 能力处理方法
  const methods = {
    // 请求手机号验证
    openMblValid: function (opts, cb, fb) {
      console.log('【手机验证】 opts: ', opts)
      let mblValid = this.selectComponent('#mblValid')
      if (mblValid && typeof (mblValid.open) === 'function') {
        mblValid.open(opts, cb, fb)
      } else {
        let errcode = 'valid_fail'
        let errmsg = '验证失败'
        if (!mblValid) {
          errcode = 'not_found'
          errmsg = '未添加验证组件'
        } else if (!mblValid.open) {
          errcode = 'no_open'
          errmsg = '验证组件未提供打开方式'
        }
        fb && fb(errcode, errmsg) // 一定要执行(否则后续处理不能正常进行)
        util.toast(errmsg)
      }
    }
  }
  // 添加处理能力
  for (let fname in methods) {
    cannotOverwritefn(defMethods, fname, methods[fname])
  }
}

// 添加默认的页面处理能力
const addPageAbility = function (ctx, defMethods) {

  // 数据定义
  ctx.data = ctx.data || {}
  ctx.data.show = !!ctx.data.show
  ctx.data.dataloading = 0

  // 不可覆盖
  const notOvers = {
    // 显示或隐藏
    show: function (b) {
      this.setData({
        show: !!b
      })
    },
    // 重新加载列表
    reloadlist: function (reset) {
      reloadlist(this, reset)
    },
    // 重新加载列表中一项
    reloadone: function (idx, reloadlist) {
      reloadone(this, idx, reloadlist)
    }
  }

  const methods = {
    // 公共输入
    onInput(e) {
      let value = e.detail.value
      let param = e.currentTarget.dataset.p
      if (param) {
        this.setData({
          [param]: (typeof (value) === 'string' ? value.trim() : value)
        })
      }
    },
    // 检查用户信息
    checkUserProfile(force) {
      // 自动注入用户信息
      let dataUser = this.data && this.data.user
      let setUserfn = typeof (this.setUser) === 'function'
      if (dataUser || setUserfn) {
        api.getUserProfile(force || (dataUser && !!dataUser.force), info => {
          let oldUser = Object.assign({}, dataUser || {})
          let newUser = Object.assign(dataUser || {}, info)
          if (dataUser) {
            this.setData({
              user: newUser
            })
          }
          if (setUserfn) {
            this.setUser(newUser, oldUser)
          }
        })
      }
    },
    // 加载更多
    loadMore: function (more) {
      // more: true: 上拉加载(下一页) ; false: 下拉刷新(第一页)
      loadMoreData(this, more)
      if (typeof (this.getCurrentTabcontent) === 'function') {
        // tab页-内容组件
        let tabcom = this.getCurrentTabcontent()
        if (tabcom) {
          loadMoreData(tabcom, more)
        }
      }
    },
    // 生命周期函数--监听页面加载
    onLoad: function (opts) {
      this.data.dataloading = 0
      this.checkUserProfile()
      if (conf.isTestEnv()) {
        let lastPageCtx = util.unsave(conf.KEY_PAGE_CTX) || {}
        console.log('【lst-page-ctx】', lastPageCtx.path, 'options', lastPageCtx.options)
        console.log('【cur-page-ctx】', this.route, 'options: ', opts)
        let path = this.route.charAt(0) == '/' ? this.route : '/' + this.route
        util.save(conf.KEY_PAGE_CTX, {
          path: path,
          options: opts
        })
      }
    },

    // 生命周期函数--监听页面初次渲染完成
    onReady: function () {
      // this.checkUserProfile()
    },

    //  生命周期函数--监听页面显示
    onShow: function () {
      // 为了防止加载数据卡死，在页面重新显示时，设置加载标识
      this.data.dataloading = 0
    },

    // 生命周期函数--监听页面隐藏
    onHide: function () {

    },

    // 生命周期函数--监听页面卸载
    onUnload: function () {

    },

    // 页面相关事件处理函数--监听用户下拉动作
    onPullDownRefresh: function () {
      // 刷新列表
      this.loadMore(false)
    },

    // 页面上拉触底事件的处理函数
    onReachBottom: function () {
      // 加载更多
      this.loadMore(true)
    },

    // 用户点击右上角分享
    onShareAppMessage: function () {
      return {
        title: '智能化推土场管理平台'
      }
    }
  }

  // 添加处理能力
  for (let fname in notOvers) {
    cannotOverwritefn(defMethods, fname, notOvers[fname])
  }
  // 添加处理能力
  for (let fname in methods) {
    mixinfn(defMethods, fname, methods[fname])
  }
}

// 添加默认的TabPage处理能力
const addTabPageAbility = function (ctx, defMethods) {
  // 页面名称
  let pageName = ctx.pageName || 'TabPage'
  // 页面的初始数据
  ctx.data = ctx.data || {}
  // 页面自定义数据
  ctx.tabarId = ''
  ctx.tabarContent = null

  // 添加tabarid(主要用于控制与tabbar关联的内容组件的显示和隐藏)
  for (let tabarId in conf.TABS) {
    ctx.data[tabarId] = false
  }

  // Tab页面方法
  const methods = {
    // 获取tabbar(调用由微信框架自动注入的getTabBar)
    getAppTabBar: function () {
      return (typeof (this.getTabBar) === 'function') ? this.getTabBar() : null
    },
    // 设置为选中
    setSelected: function () {
      let tabbar = this.getAppTabBar()
      if (tabbar) {
        tabbar.setSelected()
      }
    },
    // 设置/切换指定的Tabbar
    setTabcontent: function (id) {
      if ((id in this.data) && (id !== this.tabarId)) {
        let bar = this.getAppTabBar()
        if (bar) {
          let oldid = this.tabarId
          // console.log('切换Tabbar: ', oldid, '->', id)
          if (oldid) {
            this.setData({
              [oldid]: false,
              [id]: true
            })
          } else {
            this.setData({
              [id]: true
            })
          }
          conf.setTabarId(id)
          this.tabarId = id
          this.getCurrentTabcontent()
          bar.switchTabbar(id, pageName)
        }
      }
    },
    // 切换tab页内容
    switchTabcontent: function () {
      let tabarid = conf.getTabarId()
      if (tabarid) {
        this.setTabcontent(tabarid)
      }
    },
    // 隐藏所有tab页内容
    hideAllTabcontents: function () {
      for (let tabarId in conf.TABS) {
        ctx.data[tabarId] = false
      }
    },
    // 获取当前Tabcontent
    getCurrentTabcontent: function (cb) {
      let tab = this.selectComponent("#" + this.tabarId)
      if (tab != null) {
        this.tabarContent = tab
        cb && cb(tab)
      } else {
        wx.nextTick(() => {
          tab = this.selectComponent("#" + this.tabarId)
          if (tab != null) {
            this.tabarContent = tab
            cb && cb(tab)
          }
        })
      }
      return tab
    }
  }

  const minxfuncs = {
    // 生命周期函数--监听页面加载
    onLoad: function () {
      let tabarid = conf.getTabarId()
      console.log('【', pageName, '】', ' load, tabarId: ', tabarid)
      this.switchTabcontent()
    },
    // 生命周期回调—监听页面卸载
    onUnload: function () {
      let tabarid = conf.getTabarId()
      console.log('【', pageName, '】', ' unload, tabarId: ', tabarid)
      this.hideAllTabcontents()
    },
    // 生命周期函数--监听页面初次渲染完成
    onReady: function () {
      this.switchTabcontent()
      let tabarid = conf.getTabarId()
      let tab = this.getCurrentTabcontent()
      this.switchTabcontent()
      console.log('【', pageName, '】', ' ready, tabarId: ', tabarid, 'tabcontent(prepare): ', tab)
      if (tab && typeof (tab.prepare) === 'function') {
        let cfg = tab.prepare(this)
      }
    },
    // 生命周期函数--监听页面显示
    onShow: function () {
      this.switchTabcontent()
      let tabarid = conf.getTabarId()
      console.log('【', pageName, '】', ' show, tabarId: ', tabarid)
      this.setSelected()
      let tab = this.getCurrentTabcontent()
      if (tab && typeof (tab.onShow) === 'function') {
        tab.onShow()
      }
    },
    // 生命周期函数--生命周期回调—监听页面隐藏
    onHide: function () {
      let tabarid = conf.getTabarId()
      console.log('【', pageName, '】', ' hide, tabarId: ', tabarid)
      this.hideAllTabcontents()
    },
    // 当前是 tab 页时，点击 tab 时触发
    onTabItemTap: function (item) {
      let tab = this.getCurrentTabcontent()
      if (tab && typeof (tab.onTabItemTap) === 'function') {
        tab.onTabItemTap(item)
      }
    }
  }

  // 添加处理能力
  for (let fname in methods) {
    cannotOverwritefn(defMethods, fname, methods[fname])
  }

  // 混入处理能力
  for (let fname in minxfuncs) {
    mixinfn(defMethods, fname, minxfuncs[fname])
  }
}

/**
 * TabPage页扩展
 */
const tabpage = function (page) {
  // 添加默认页面处理能力
  addPageAbility(page, page)
  // 添加默认Tab页面处理能力
  addTabPageAbility(page, page)
  // 添加授权处理能力
  addUserAuthAbility(page, page)
  // 添加手机验证能力
  addMblValidAbility(page, page)

  return page
}

/**
 * Page扩展
 */
const page = function (page) {
  // 添加默认页面处理能力
  addPageAbility(page, page)
  // 添加分页处理能力
  addDataPagingAbility(page, page)
  // 添加授权处理能力
  addUserAuthAbility(page, page)
  // 添加手机验证能力
  addMblValidAbility(page, page)
  return page
}

/**
 * Component扩展
 */
const component = function (com) {
  com.data = com.data || {}
  com.methods = com.methods || {}

  // 组件数据
  com.data.show = !!com.data.show
  com.data.dataloading = 0 // 数据加载标识

  // 添加分页处理能力
  addDataPagingAbility(com, com.methods)

  // 组件方法: prepare
  mixinfn(com.methods, 'prepare', function (page) {
    this.page = page
  })
  // 组件方法: getPage
  overwritefn(com.methods, 'getPage', function () {
    let page = this.page
    if (!page) {
      let pages = getCurrentPages()
      page = pages.length ? pages[pages.length - 1] : null
    }
    return page
  })
  // 组件方法: setTabcontent
  overwritefn(com.methods, 'setTabcontent', function (id) {
    let page = this.getPage()
    if (page) {
      page.setTabcontent(id)
    }
  })
  // 组件方法: reloadlist
  overwritefn(com.methods, 'reloadlist', function (reset) {
    reloadlist(this, reset)
  })
  // 组件方法: reloadone
  overwritefn(com.methods, 'reloadone', function (idx, reloadlist) {
    reloadone(this, idx, reloadlist)
  })


  // 显示或隐藏
  overwritefn(com.methods, 'show', function (b) {
    this.setData({
      show: !!b
    })
  })

  // 生命周期方法
  mixinfn(com, 'ready', function () {
    // 自动注入用户信息
    let dataUser = this.data && this.data.user
    let setUserfn = typeof (this.setUser) === 'function'
    if (dataUser || setUserfn) {
      api.getUserProfile(dataUser && !!dataUser.force, info => {
        let newUser = Object.assign(dataUser || {}, info)
        if (dataUser) {
          this.setData({
            user: newUser
          })
        }
        if (setUserfn) {
          this.setUser(newUser)
        }
      })
    }
  })

  // 返回定义
  return com
}

// 导出
const mixin = {
  tabpage,
  page,
  component
}

// 导出
module.exports = {
  isEqualList,
  mixin,
  ext,
  conf,
  util,
  api
}