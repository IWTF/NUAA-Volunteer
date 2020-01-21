// miniprogram/pages/actList/actList.js
const util = require('../../utils/utils.js');

Page({
  data: {
    scale: wx.getStorageSync("scale"),
    barHeight: wx.getStorageSync("barHight"),
    currentItemId: 0,
    publishBtnClass: 'publishBtnShow', // 发表按钮的显示样式类
    loadTime: 0,
    aitivities: [],
    doingAct: [],
    doneAct: [],
    scrollTop: 0,
  },

  onLoad: function () {
    wx.showLoading({ title: '加载中...' })

    let dateObj = new Date()
    let year = dateObj.getFullYear()
    let month = util.formatNumber(dateObj.getMonth()+1)
    let date = year + '-' + month
    this.setData({ date })

    // 获取正在进行的活动
    wx.cloud.callFunction({
      name: 'getHomeData',
      data: {
        action: 'getDoingAct'
      }
    }).then(res => {
      let doingAct = res.result.data
      this.setData({ doingAct })
      wx.hideLoading()
    })

    // 获取正在进行的活动
    wx.cloud.callFunction({
      name: 'getHomeData',
      data: {
        action: 'getDoneAct',
        year: year,
        month: month,
      }
    }).then(res => {
      let doneAct = res.result.data
      this.setData({ doneAct })
    })
  },

  onShow() {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == '') { // 未设置缓存
      wx.showModal({
        title: '信息绑定',
        content: '请先绑定个人信息',
        showCancel:false
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '../userInfo/userInfo',
        })
      }, 1000)
      this.setData({ login: false, userInfo })
    } else {
      this.setData({ login: true, userInfo })
    }
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading()

    // 获取正在进行的活动
    wx.cloud.callFunction({
      name: 'getHomeData',
      data: {
        action: 'getDoingAct'
      }
    }).then(res => {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
      let doingAct = res.result.data
      this.setData({ doingAct })
    })
  },

  /**
   * 更改 tab 选项
   */ 
  changeTab(e) {
    // 这里不是 data- 传参，所以用target
    let tab = e.target.dataset.index
    this.setData({ currentItemId: tab })
  },
  // 滚动swiper触发事件，改变tab样式
  scrollChange(e) {
    this.setData({ currentItemId: e.detail.current })
  },

  /**
   * 跳转传参，进入相应del
   */ 
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
  PageScroll(res) {
    let preTop = this.data.scrollTop
    let { scrollTop } = res.detail
    
    if ((preTop-scrollTop) < 0) {
      this.setData({
        publishBtnClass: 'publishBtnHide',
        scrollTop
      })
    } else {
      this.setData({
        publishBtnClass: 'publishBtnShow',
        scrollTop
      })
    }
  },

  bindDateChange: function(e) {
    wx.showLoading({ title: '加载中...' })
    // 跟新picker
    let date = e.detail.value
    this.setData({ date })

    // 获取正在进行的活动
    let year = date.split('-')[0]
    let month = date.split('-')[1]

    wx.cloud.callFunction({
      name: 'getHomeData',
      data: {
        action: 'getDoneAct',
        year: year,
        month: month,
      }
    }).then(res => {
      let doneAct = res.result.data
      this.setData({ doneAct })
      wx.hideLoading()
    })
  },
})