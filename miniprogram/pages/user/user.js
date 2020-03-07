// miniprogram/pages/user/user.js
Page({
  data: {
    tolTime: '0'
  },

  onLoad() {
    // 判断是否绑定信息，是：显示时长，否：显示--
    let userInfo = wx.getStorageSync('userInfo')
    let {stuId} = userInfo
    
    if (userInfo == '') { // 未设置缓存
      this.setData({ login: false, userInfo })
    } else {
      this.getTolTime(stuId)
      this.setData({ login: true, userInfo })
    }
  },

  /**
   * 在页面渲染时，判断是否具有用户信息
   */
  onShow () {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == '') { // 未设置缓存
      this.setData({ login: false, userInfo })
    } else {
      this.setData({ login: true, userInfo })
    }
  },

  /**
   * 设置【手动更新志愿时长】函数，避免页面频繁的请求
   */
  updateT () {
    let userInfo = wx.getStorageSync('userInfo')
    let {stuId} = userInfo
    
    this.getTolTime(stuId)
  },

  /**
   * 跳转函数的封装 
   */
  navFunc (e) {
    console.log(e)
    let { url } = e.currentTarget.dataset
    if (url == 'about' || url == 'creater') {
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

  /**
   * 请求数据库，获取总的志愿时长
   */
  getTolTime (stuId) {
    wx.cloud.callFunction({
      name: 'userData',
      data: {
        action: 'getCertifiedAct',
        stuId: stuId,
      },
      success: res => {
        let { data } = res.result

        // 将数据存入缓存，减少网络请求
        wx.setStorageSync('allActs', data)

        let sum = 0
        for (let i=0; i<data.length; i++) {
          if (data[i].actInfo) {
            sum += (data[i].actInfo.duration-'0')
          } else {
            sum += (data[i].duration-'0')
          }
        }
        this.setData({ tolTime: sum })
      }
    })
  }
})