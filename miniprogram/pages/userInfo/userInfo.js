// miniprogram/pages/userInfo/userInfo.js
const db = wx.cloud.database()

Page({
  data: {
    barHeight: wx.getStorageSync("barHight"),
    userInfo: {},
    login: false,
    showModel: true
  },
  modalConfirm() {
    this.setData({
      showModel: false
    })
  },

  onLoad () {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == '') { // 未设置缓存
      this.setData({ login: false, userInfo })
    } else {
      this.setData({ login: true, userInfo })
    }
  },

  onShow () {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo != '') {
      this.setData({ login: true, showModel: false, userInfo })
    }
  },

  cancelBanding () {
    wx.clearStorageSync()
    this.setData({ login: false })
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        wx.setStorageSync('openid', res.result.openid)
      }
    })
  },

  formSubmit (e) {
    var that = this;
    
    wx.showLoading({ title: '绑定中...' })

    let { username, stuId } = e.detail.value;
    if (username == "" || stuId == "") {  // 表单验证
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
    } else {  // 添加新用户
      const openid = wx.getStorageSync('openid')

      // 先查询数据库，看该学号是否绑定
      db.collection('users').where({
        stuId: stuId
      }).get({ // 已绑定，报错提示，请联系管理员
        success: res => {
          // 未绑定，则绑定新用户，连系openid与学号
          if (res.data.length === 0) {  
            // 绑定新用户前，先判断该手机号有没有绑定

            let authoirty = 'user'
            if (username == '石榴团委' && stuId == '2019100116') {
              authoirty = 'superAdmin'
            }

            let data = {
              username,
              stuId,
              authority: authoirty
            }
            db.collection('users').add({
              data: data,
              success: res => {
                let userInfo = {
                  _openid: openid,
                  username: data.username,
                  stuId: data.stuId,
                  authority: data.authority
                }

                that.setData({ userInfo, login: true })
                wx.setStorageSync('userInfo', userInfo)

                wx.hideLoading()
                wx.showToast({ title: '绑定成功', })
              },
              fail: err => {
                wx.hideLoading()
                wx.showToast({ icon: 'none', title: '绑定失败,请稍后重试' })
              }
            })
          } else {
            let userInfo = res.data[0]
            console.log("database is:", res.data)
            console.log("database openid: ", userInfo._openid)
            console.log("手机本机的openid", openid)

            if (userInfo._openid == openid) {
              // 是原绑定用户, 绑定信息
              if (userInfo.username != username) {
                wx.showToast({ icon: 'none', title: '一个手机只能绑定一个用户', })
                return
              }

              that.setData({ userInfo, login: true })
              wx.setStorageSync('userInfo', userInfo)

              wx.hideLoading()
              wx.showToast({ title: '绑定成功', })
            } else {
              wx.hideLoading()
              wx.showToast({ icon: 'none', title: '该用户已绑定' })
            }
          } // 判断数据为null 的else end
        }
      })
      
    }   // 最外层 if 
  }
})