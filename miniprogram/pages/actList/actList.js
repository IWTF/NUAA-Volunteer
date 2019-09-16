// miniprogram/pages/actList/actList.js
Page({
  data: {
    tab: 1,
    publishBtnClass: 'publishBtnShow', // 发表按钮的显示样式类
    currentScrollTop: 0,
  },

  onLoad: function (options) {

  },

  changeTab (e) {
    let tab = e.target.dataset.index
    this.setData({ tab })
  },

  /**
   * 监听页面滑动
   */
  onPageScroll(res) {
    console.log('onPageScroll :', res.scrollTop, this.data.currentScrollTop)
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