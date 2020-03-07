// miniprogram/pages/myVerify/myVerify.js
Page({

  data: {
    barHeight: wx.getStorageSync("barHight"),
    datalist: [],
    userInfo: {},
    nullText: "还没有被认证的志愿活动..."
  },

  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    
    if (userInfo == '') {
      this.setData({ nullText: "绑定身份后才能同步个人信息哦~"})
    } else {
      this.setData({ userInfo })
    
      const datalist = wx.getStorageSync('allActs')
      this.setData({ datalist })
    }
  },

  changeOrder () {
    let { datalist } = this.data
    datalist.reverse()
    this.setData({ datalist })
  }

})