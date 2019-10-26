// miniprogram/pages/user/user.js
Page({
  data: {
    tolTime: ''
  },

  onLoad() {
    // 判断是否绑定信息，是：显示时长，否：显示--
    let userInfo = wx.getStorageSync('userInfo')

    if (userInfo == '') { // 未设置缓存
      this.setData({ tolTime: '0'})
    } else {
      const db = wx.cloud.database()

      db.collection('registerInfo').where({
        _openid: userInfo._openid
      }).get({
        success: res => {
          let data = res.data
          let sum = 0
          for (let i=0; i<data.length; i++) {
            sum += (data[i].duration-'0')
          }
          this.setData({ tolTime: sum })
        }
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