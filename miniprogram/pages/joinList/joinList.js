// miniprogram/pages/actList/actList.js
Page({
  data: {
    currentItemId: 0,
    publishBtnClass: 'publishBtnShow', // 发表按钮的显示样式类
    currentScrollTop: 0,
  },

  onLoad: function (options) {

  },

  // 更改 tab 选项
  changeTab(e) {
    let tab = e.target.dataset.index
    this.setData({ currentItemId: tab })
  },
  // 滚动swiper触发事件，改变tab样式
  scrollChange(e) {
    this.setData({ currentItemId: e.detail.current })
  },

  // 跳转传参，进入相应del
  navToDel() {
    wx.navigateTo({
      url: '../actDel/actDel',
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