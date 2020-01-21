// miniprogram/pages/myVerify/myVerify.js
Page({

  data: {
    barHeight: wx.getStorageSync("barHight"),
    datalist: [],
    userInfo: {}
  },

  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo })
    
    const datalist = wx.getStorageSync('allActs')
    this.setData({ datalist })
  },

  changeOrder () {
    let { datalist } = this.data
    datalist.reverse()
    this.setData({ datalist })
  }

})