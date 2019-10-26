// miniprogram/pages/userInfo/userInfo.js
Page({

  data: {
    barHeight: wx.getStorageSync("barHight"),
    userInfo: {},
    login: false
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
    if (userInfo == '') { // 未设置缓存
      let info = "一经绑定，不能修改；身份绑定是志愿时长认证唯一依据，请如实填写！"
      wx.showModal({
        title: '注意事项',
        content: info,
      })
    } else {
      this.setData({ login: true, userInfo })
    }
    
  },

  cancelBanding () {
    wx.setStorageSync('userInfo', '')
    this.setData({ login: false })
  },

  formSubmit (e) {
    var that = this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let { username, stuId } = e.detail.value;
    if (username == "" || stuId == "") {
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
    } else {
      const openid = wx.getStorageSync('openid')

      const db = wx.cloud.database()

      // 先查询数据库，看该学号是否绑定
      db.collection('users').where({
        stuId: stuId
      }).get({ // 已绑定，报错提示，请联系管理员
        success: res => {
          console.log("查询结果为: ", res)

          // 未绑定，则绑定新用户，连系openid与学号
          if (res.data.length === 0) {
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

                // console.log("create a new user", userInfo)
                that.setData({ userInfo, login: true })
                wx.setStorageSync('userInfo', userInfo)

                wx.showToast({ title: '绑定成功', })
              },
              fail: err => {
                wx.showToast({ icon: 'none', title: '绑定失败,请稍后重试' })
              }
            })
          } else {
            // console.log("重复数据为：", res)
            let userInfo = res.data[0]

            if (userInfo._openid == openid) {
              // 是原绑定用户, 绑定信息
              console.log("openid is right", userInfo)
              that.setData({ userInfo, login: true })
              wx.setStorageSync('userInfo', userInfo)

              wx.showToast({ title: '绑定成功', })
            } else {
              wx.showToast({ icon: 'none', title: '该用户已绑定' })
            } // else end
          }
        }
      })
      
    }
  }
})