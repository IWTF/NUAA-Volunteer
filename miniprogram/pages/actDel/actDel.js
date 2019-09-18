// miniprogram/pages/actDel/actDel.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentItemId: 0,
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
  }
})