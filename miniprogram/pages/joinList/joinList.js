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
    let openid = wx.getStorageSync('openid')

    this.initData(openid)
  },

  initData (openid) {
    const db = wx.cloud.database()
    let now = util.formatDate(new Date()) + " " + util.formatTime(new Date())
    let nowArr = now.split('-')
    now = nowArr[1]+"-"+nowArr[2]

    db.collection('registerInfo').where({
      _openid: openid
    }).get({
      success: res => {
        let ret = res.data
        let doingArr = [] 
        let doneArr = []
        for (let i=0; i<ret.length; i++) {
          let { beg, end } = util.getBETime([ret[i].actInfo, ])
          if (now < end) {
            doingArr.push(ret[i])
          } else {
            doneArr.push(ret[i])
          }
        }
        this.setData({ doingArr, doneArr })
      }
    })
  },

  // 更改 tab 选项
  changeTab(e) {
    let tab = e.currentTarget.dataset.index
    this.setData({ currentItemId: tab })
  },
  // 滚动swiper触发事件，改变tab样式
  scrollChange(e) {
    this.setData({ currentItemId: e.detail.current })
  },

  // 跳转传参，进入相应del
  navToDel() {
    // 活动结束时间、参与情况、活动唯一id
    let tmParams = {
      id: 0,
      deadline: '2021-09-01',
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