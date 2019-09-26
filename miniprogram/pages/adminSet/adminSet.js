// miniprogram/pages/adminSet/adminSet.js
Page({
  data: {
    scale: wx.getStorageSync("scale"),
    barHeight: wx.getStorageSync("barHight"),
    currentItemId: 0,
    publishBtnClass: 'publishBtnShow', // 发表按钮的显示样式类
    currentScrollTop: 0,
    adminList: [],
    delArr: []
  },

  onLoad: function (options) {
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
  },

  // 更改 tab 选项
  changeTab(e) {
    let tab = e.target.dataset.index
    this.setData({ currentItemId: tab })
  },
  // 滚动swiper触发事件，改变tab样式
  scrollChange(e) {
    this.setData({ currentItemId: e.detail.current })
  },

  // 管理员 编辑页面
  edit() {
    this.setData({ showEdit: true })
  },
  eidtDone() {
    let { delArr, adminList } = this.data

    let delItemId = []
    adminList.map((item, index) => {
      if (delArr.indexOf(index) >= 0) {
        delItemId.push(item._id)
      }
    })
    console.log("del item is: ", delItemId)

    adminList = adminList.filter((item, index) => delArr.indexOf(index) < 0)

    // 后期肯定要加提示，以免误删 ==============================
    this.setData({
      showEdit: false,
      adminList
    })
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
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let { username, stuId } = e.detail.value;
    console.log
    if (username == "" || stuId == "") {
      wx.showToast({ title: '请把表单填写完整', icon: 'none' })
    } else {
      const db = wx.cloud.database()
      
      db.collection('users').where({
        stuId: stuId,
        username: username
      }).get({
        success: res => {
          console.log('[数据库] [查询记录] 成功: ', res)
          let newAdmin = res.data[0]

          db.collection('users').doc(newAdmin._id).update({
            data: {
              authority: 'admin'
            },
            success: res => {
              // 清空表单 ； 提示状态
              let { adminList } = that.data
              adminList.push(newAdmin)
            
              that.setData({ username: '', stuId: '', adminList })
              wx.showToast({ title: '添加成功', })
            }
          })
        },
        fail: err => {
          wx.showToast({ icon: 'none', title: '该用户不存在' })
        }
      })
    }
  },
})