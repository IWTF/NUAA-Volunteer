// miniprogram/pages/adminSet/adminSet.js
Page({
  data: {
    scale: wx.getStorageSync("scale"),
    barHeight: wx.getStorageSync("barHight"),
    currentItemId: 0,
    adminList: [],
    delArr: [],
    updateData: false   // 切换至管理页面时，是否请求数据, false表示不用更新数据
  },

  onLoad: function (options) {
    this.updateAdminList()
  },

  // 更改 tab 选项
  changeTab(e) {
    let tab = e.target.dataset.index
    this.setData({ currentItemId: tab })
  },
  // 滚动swiper触发事件，改变tab样式
  scrollChange(e) {
    this.setData({ currentItemId: e.detail.current })
    
    let { currentItemId, updateData } = this.data
    if (currentItemId == 1 && updateData) {
      this.updateAdminList()
      this.setData({ updateData: false })
    }
  },

  // 管理员 编辑页面
  edit() {
    this.setData({ showEdit: true })
  },
  // 编辑完成，将更新数据提交至服务器
  eidtDone() {
    let that = this
    
    if (this.data.delArr.length == 0) {
      wx.showModal({
        title: '提示',
        content: '没有做出更改',
        showCancel: false
      })
      that.setData({ showEdit: false })
      return
    }
    
    wx.showModal({
      title: '提示',
      content: '请确定信息无误！',
      success(res) {
        if (res.confirm) {
          console.log("+++++++确定")
          let { delArr, adminList } = that.data

          // 获取要删除的管理员的 用户id
          let delItemId = []
          adminList.map((item, index) => {
            if (delArr.indexOf(index) >= 0) {
              console.log("============", index)
              delItemId.push(item._id)
            }
          })

          wx.showLoading({ title: '提交中' })
          if (delItemId.length === 0) {
            return
          }
          wx.cloud.callFunction({
            name: 'updateAdmin',
            data: {
              action: 'delAdmin',
              delItemId
            },
            success: res => {
              wx.hideLoading()
              if (res.result.stats.updated === 0) {
                wx.showToast({ icon: 'none', title: 'Error 请稍后重试' })
              }
            }
          })

          adminList = adminList.filter((item, index) => delArr.indexOf(index) < 0)

          // 更新本地数据
          that.setData({
            adminList
          })
        } else if (res.cancel) {
          console.log("+++++++取消")
        }
      }
    })  // showModel结束

    that.setData({ showEdit: false })

  },
  // 删除 管理员
  delItem(e) {
    console.log("Del Item")
    let { index } = e.currentTarget.dataset
    let { delArr, adminList } = this.data

    if (delArr.indexOf(index) >= 0) {
      delArr.splice(delArr.indexOf(index), 1)
      adminList[index].delSelect = false
    } else {
      delArr.push(index)
      adminList[index].delSelect = true
    }
    this.setData({
      delArr,
      adminList
    })
  },


  formSubmit: function (e) {
    var that = this;
    // console.log('form发生了submit事件，携带数据为：', e.detail.value)
    // 获取表单数据
    let { username, stuId } = e.detail.value;
   
    // 表单检验
    if (username == "" || stuId == "") {
      wx.showToast({ title: '请把表单填写完整', icon: 'none' })
    } else {
      // 调用更新用户权限的云函数
      wx.cloud.callFunction({
        name: 'updateAdmin',
        data: {
          action: 'addAdmin',
          authority: 'admin',
          username,
          stuId
        },
        success: res => {
          console.log("update Admin 云函数调用成功", res)
          if (res.result.stats.updated === 0) {
            wx.showToast({ icon: 'none', title: '账号未注册' })
          } else {
            wx.showToast({ title: '添加成功' })

            that.setData({ username: '', stuId: '', updateData: true })
          }
        }
      })
    }
  },

  updateAdminList () {
    const db = wx.cloud.database()

    db.collection('users').where({
      authority: 'admin'
    }).get({
      success: res => {
        this.setData({ adminList: res.data })
      },
      fail: err => {
        wx.showToast({ icon: 'none', title: '加载数据失败' })
      }
    })
  }
})