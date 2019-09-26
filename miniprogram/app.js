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
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
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
        console.log('[云函数] [login] user openid: ', res.result.openid)
        wx.setStorageSync('openid', res.result.openid)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })

    this.globalData = {
    }
  }
})
