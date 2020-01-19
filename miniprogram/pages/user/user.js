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
      // this.setData({ tolTime: '0'})
    } else {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('registerInfo').where(_.or([
        {
          stuId: stuId,
          certified: true
        },
        {
          stuId: parseInt(stuId),
          certified: "true"
        }
      ])).get({
        success: res => {
          let data = res.data
          let sum = 0
          for (let i=0; i<data.length; i++) {
            if (data[i].certified)
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

  /**
   * 更新志愿时长
   */
  updateT () {
    let userInfo = wx.getStorageSync('userInfo')
    let {stuId} = userInfo
    
    const db = wx.cloud.database()
    const _ = db.command

    db.collection('registerInfo').where(_.or([
      {
        stuId: stuId,
        certified: true
      },
      {
        stuId: parseInt(stuId),
        certified: "true"
      }
    ])).get({
      success: res => {
        let data = res.data
        let sum = 0
        for (let i=0; i<data.length; i++) {
          if (data[i].certified)
            sum += (data[i].duration-'0')
        }
        this.setData({ tolTime: sum })
      }
    })
  },

  navToJoin() {
    wx.switchTab({
      url: '/pages/joinList/joinList',
    })
  },


})