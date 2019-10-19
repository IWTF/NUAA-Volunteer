//app.js
App({
  onLaunch: function () {
    /*************************  导航栏 高度适配  *************************/
    const vm = this
    wx.getSystemInfo({
      success: function (res) {
        let totalTopHeight = 68
        if (res.model.indexOf('iPhone X') !== -1) {
          totalTopHeight = 88
        } else if (res.model.indexOf('iPhone') !== -1) {
          totalTopHeight = 64
        }
        wx.setStorageSync("barHight", totalTopHeight)
      },
      failure() {
        wx.setStorageSync("barHight", 68)
      }
    })

    const designWidth = 375
    const { windowWidth, statusBarHeight, safeArea  } = wx.getSystemInfoSync()
    console.log("statusBarHeight", statusBarHeight, safeArea )

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    /*************************  获取用户的 openID  ************************/
    let scale = windowWidth / designWidth
    wx.setStorageSync("scale", scale)

    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        wx.setStorageSync('openid', res.result.openid)
      }
    })

    this.globalData = {
    }
  }
})
