// miniprogram/pages/user/user.js
Page({
  data: {

  },

  onLoad() {
    
  },

  onShow () {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == '') { // 未设置缓存
      this.setData({ login: false, userInfo })
    } else {
      this.setData({ login: true, userInfo })
    }
  },

  navFunc (e) {
    console.log(e)
    let { url } = e.currentTarget.dataset
    if (url == 'plane' || url == 'about' || url == 'creater') {
      wx.showToast({ title: '待开发', icon: 'none' })
      return 
    }
    wx.navigateTo({
      url: '../' + url + '/' + url,
    })
  },


  navToJoin() {
    wx.switchTab({
      url: '/pages/joinList/joinList',
    })
  },


})