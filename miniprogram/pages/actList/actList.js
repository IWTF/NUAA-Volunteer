// miniprogram/pages/actList/actList.js
const util = require('../../utils/utils.js');

Page({
  data: {
    scale: wx.getStorageSync("scale"),
    barHeight: wx.getStorageSync("barHight"),
    currentItemId: 0,
    publishBtnClass: 'publishBtnShow', // 发表按钮的显示样式类
    currentScrollTop: 0,
    loadTime: 0,
    aitivities: [],
    doingAct: [],
    doneAct: []
  },

  onLoad: function (options) {
    
    this.loadAct()
    // 均存入缓存，避免造成卡顿
    // onload加载限定数量数据
    // 下拉刷新加载更新
    // 上滑加载更多

    // 实现一个全局函数，用于活动参与人数的 增加
  },

  onShow() {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == '') { // 未设置缓存
      this.setData({ login: false, userInfo })
    } else {
      this.setData({ login: true, userInfo })
    }
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading()

    let promise = this.loadAct()
    promise.then(res => {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    })
  },

  // 更改 tab 选项
  changeTab(e) {
    // 这里不是 data- 传参，所以用target
    let tab = e.target.dataset.index
    this.setData({ currentItemId: tab })
  },
  // 滚动swiper触发事件，改变tab样式
  scrollChange(e) {
    this.setData({ currentItemId: e.detail.current })
  },

  // 跳转传参，进入相应del
  navToDel (e) {
    let { doingAct, doneAct } = this.data

    // 获取用户是否已报名，在报名后添加缓存！！
    let { index, state } = e.currentTarget.dataset

    let actInfo
    if (state == 'doing') {
      actInfo = doingAct[index]
    } else {
      actInfo = doneAct[index]
    }
    
    let tmParams = {
      actInfo,
      join: false
    }
    let params = JSON.stringify(tmParams)

    wx.navigateTo({
      url: '../actDel/actDel?params=' + params,
    })
  },

  navToPublishNote () {
    wx.navigateTo({
      url: '../actPublish/actPublish',
    })
  },

  /**
   * 监听页面滑动
   */
  onPageScroll(res) {
    var top = res.scrollTop
    if (top >= this.data.currentScrollTop + 5) {
      this.setData({
        publishBtnClass: 'publishBtnHide',
        currentScrollTop: top
      })
    } else if (top <= this.data.currentScrollTop - 5) {
      this.setData({
        publishBtnClass: 'publishBtnShow',
        currentScrollTop: top
      })
    }
  },

  formatData (res) {
    let { nowTime } = this.data
    let doingAct = []
    let doneAct = []

    for (let i=0; i<res.length; i++) {
      if (res[i].deadline > nowTime) {
        doingAct.push(res[i])
      } else {
        doneAct.push(res[i])
      }
    }
    this.setData({ doingAct, doneAct })
  },

  loadAct () {
    return new Promise((resolve, reject) => {
      let { loadTime } = this.data
      let date = util.formatDate(new Date())
      let time = util.formatTime(new Date())

      this.setData({ nowTime: date + ' ' + time })

      const db = wx.cloud.database()
      db.collection('activities').get({
        success: res => {
          this.formatData(res.data)
          resolve()
        }
      })
    })
  }
})