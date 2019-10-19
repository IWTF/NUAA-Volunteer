// miniprogram/pages/user/user.js
Page({
  data: {
    tolTime: ''
  },

  onLoad() {
    // 判断是否绑定信息，是：显示时长，否：显示--
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == '') { // 未设置缓存
      this.setData({ tolTime: '--'})
    } else {
      const db = wx.cloud.database()
      const $ = db.command.aggregate

      db
        .collection('registerInfo')
        .aggregate()
        .group({
          _id: null,
          totalPrice: $.sum('$duration')
        })
        .end()
        .then((e) => {
          console.log("+++++++++++++++", e)
        })
      
    }
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