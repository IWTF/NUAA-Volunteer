// miniprogram/pages/user/user.js
Page({
  data: {

  },

  navToInfo() {
    wx.navigateTo({
      url: '../userInfo/userInfo',
    })
  },

  navToVerify() {
    wx.navigateTo({
      url: '../myVerify/myVerify',
    })
  },

  navToJoin() {
    console.log("====================")
    wx.switchTab({
      url: '/pages/joinList/joinList',
    })
  }
})