// miniprogram/pages/actDel/actDel.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab: 1,
  },

  onLoad: function (options) {

  },

  // 更改 tab 选项
  changeTab(e) {
    let tab = e.target.dataset.index
    this.setData({ tab })
  },
})