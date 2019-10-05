// miniprogram/pages/actList/actList.js
const util = require('../../utils/utils.js');

Page({
  data: {
    scale: wx.getStorageSync("scale"),
    barHeight: wx.getStorageSync("barHight"),
    currentItemId: 0,
    publishBtnClass: 'publishBtnShow', // 发表按钮的显示样式类
    currentScrollTop: 0,
  },

  onLoad: function (options) {
    wx.setStorageSync('updateJoinList', true)
  },

  onShow () {
    let openid = wx.getStorageSync('openid')
    
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == '') { // 未设置缓存
      this.setData({ login: false, userInfo })
      this.setData({ doingArr: [], doneArr: [] })
      return
    } else {
      this.setData({ login: true, userInfo })
    }

    let update = wx.getStorageSync('updateJoinList')
    if (update) {
      wx.setStorageSync('updateJoinList', false)
      this.initData(openid)
    }
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading()

    let { openid } = this.data
    let promise = this.initData(openid)
    promise.then(res => {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    })
  },

  initData (openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      let now = util.formatDate(new Date()) + " " + util.formatTime(new Date())
      let nowArr = now.split('-')
      now = nowArr[1] + "-" + nowArr[2]

      db.collection('registerInfo').where({
        _openid: openid
      }).get({
        success: res => {
          let ret = res.data
          let doingArr = []
          let doneArr = []
          for (let i = 0; i < ret.length; i++) {
            let { beg, end } = util.getBETime([ret[i].actInfo,])
            if (now < end) {
              doingArr.push(ret[i])
            } else {
              doneArr.push(ret[i])
            }
          }
          this.setData({ doingArr, doneArr })
          resolve()
        }
      })
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
  navToDel(e) {
    let index = e.currentTarget.dataset.index
    let { doingArr } = this.data
    // 活动结束时间、参与情况、活动唯一id
    let tmParams = {
      actInfo: doingArr[index],
      join: true
    }
    let params = JSON.stringify(tmParams)

    wx.navigateTo({
      url: '../actDel/actDel?params=' + params,
    })
  },

  navToPublishNote() {
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
  }
})