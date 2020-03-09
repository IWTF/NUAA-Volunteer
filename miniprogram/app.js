//app.js
App({
  onLaunch: function () {
    // 开启转发功能
    wx.showShareMenu({
      withShareTicket: true
    })

    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log('onCheckForUpdate====', res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          console.log('res.hasUpdate====')
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                console.log('success====', res)
                // res: {errMsg: "showModal: ok", cancel: false, confirm: true}
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    }

    /*************************  导航栏 高度适配  *************************/
    const vm = this
    // wx.getSystemInfo({
    //   success: function (res) {
    //     // 获取时间，闹钟等工具栏高度
    //     // iPhone 11 适配有问题，应该是真机获取机型信息有错误...
    //     wx.setStorageSync('toolBar', res.statusBarHeight)
    //     console.log("height:", res.statusBarHeight)

    //     let totalTopHeight = 68
    //     if (res.model.search('iPhone X') !== -1) {
    //       totalTopHeight = 88
    //     } else if (res.model.indexOf('iPhone') !== -1) {
    //       totalTopHeight = 64
    //     } else if (res.model.indexOf('Android') !== -1) {
    //       totalTopHeight = 68
    //     } else if (res.model.indexOf('samsung') !== -1) {
    //       totalTopHeight = 72
    //     }
    //     wx.setStorageSync("barHight", totalTopHeight)
    //   },
    //   failure() {
    //     wx.setStorageSync("barHight", 68)
    //   }
    // })

    // const designWidth = 375
    // const { windowWidth, statusBarHeight, safeArea  } = wx.getSystemInfoSync()
    // console.log("statusBarHeight", statusBarHeight, safeArea )

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    /*************************  获取用户的 openID  ************************/
    // let scale = windowWidth / designWidth
    // wx.setStorageSync("scale", scale)

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
