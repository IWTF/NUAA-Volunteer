// miniprogram/pages/actDel/actDel.js
const util = require('../../utils/utils.js');

/*
* 活动内容通过跳转 传值
* 
* 成员信息需要请求数据库
*/

Page({

  /**
   * 页面的初始数据
   */
  data: {
    barHeight: wx.getStorageSync("barHight"),
    currentItemId: 0,
    showEdit: false,
    delArr: [],
    addArr: [],
    users: [],
    isOver: false,
    join: false,
    actInfo: {},
    first: true
  },

  // 传参是一个对象，actInfo，和join字段
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == '') { // 未设置缓存
      this.setData({ login: false, userInfo })
    } else {
      this.setData({ login: true, userInfo })
    }

    var params = JSON.parse(options.params)
    let { actInfo, join } = params
    let date = util.formatDate(new Date()) + " " + util.formatTime(new Date())
    
    let isOver = date>actInfo.deadline ? true:false

    let acTime = util.getBETime(actInfo.timeDots)
    this.setData({ acTime })

    this.setData({ isOver, join, actInfo })
  },

  // 更改 tab 选项
  changeTab(e) {
    let tab = e.target.dataset.index
    this.setData({ currentItemId: tab })

    if (this.data.first && tab == 1) {
      this.getParterList()
      this.setData({ first: false })
    }
  },
  // 滚动swiper触发事件，改变tab样式
  scrollChange(e) {
    this.setData({ currentItemId: e.detail.current })

    if (this.data.first && e.detail.current == 1) {
      this.getParterList()
      this.setData({ first: false })
    }
  },

  // 管理员 编辑页面
  edit () {
    switch (this.data.currentItemId) {
      case 0:
        console.log("跳转活动发布页面")
        break
      case 1:
        this.setData({ showEdit: true })
        break
      default: break
    }
  },
  eidtDone () {
    let { addArr, delArr, users } = this.data

    // 更改报名人员列表，若有删除，则执行下面代码
    if (delArr.length > 0) {
      let newDel = []
      users.map((item, index) => {
        if (delArr.indexOf(index) >= 0) {
          newDel.push(item._id)
        }
      })
      this.delParterList(newDel)
    }

    // 更改报名人员列表，若有认证，则执行下面代码
    if (addArr.length > 0) {
      let newAdd = []
      users.map((item, index) => {
        if (addArr.indexOf(index) >= 0) {
          newAdd.push(item._id)
        }
      })
      this.updateParterList(newAdd)
    }

    let arr = addArr.concat(delArr)
    users = users.filter((item, index) => arr.indexOf(index)<0);

    // 后期肯定要加提示，以免误删 ==============================
    this.setData({
      showEdit: false,
      users
    })
  },

  // 添加/删除 参与成员
  addItem (e) {
    let { index } = e.currentTarget.dataset
    let { addArr, delArr, users } = this.data

    if (addArr.indexOf(index) >= 0) {
      addArr.splice(addArr.indexOf(index), 1)
      users[index].addSelect = false
    } else {
      if (delArr.indexOf(index) >= 0) {
        delArr.splice(delArr.indexOf(index), 1)
        users[index].delSelect = false
      }
      addArr.push(index)
      users[index].addSelect = true
    }
    this.setData({
      addArr,
      delArr,
      users
    })
  },
  delItem (e) {
    console.log("Del Item")
    let { index } = e.currentTarget.dataset
    let { addArr, delArr, users } = this.data

    if (delArr.indexOf(index) >= 0) {
      delArr.splice(delArr.indexOf(index), 1)
      users[index].delSelect = false
    } else {
      if (addArr.indexOf(index) >= 0) {
        addArr.splice(addArr.indexOf(index), 1)
        users[index].addSelect = false
      }
      delArr.push(index)
      users[index].delSelect = true
    }
    this.setData({
      addArr,
      delArr,
      users
    })
  },

  /* 报名/取消报名 */
  signUp () {
    let { actInfo } = this.data

    wx.navigateTo({ url: '../actSign/actSign?params=' + JSON.stringify(actInfo) })
  },

  signOut () {
    
  },

  // 提示用户绑定个人信息
  bindInfo () {
    wx.showToast({ title: '请先绑定个人信息', icon: 'none', })
  },

  // 提示活动已结束
  bindEnd () {
    wx.showToast({ title: '活动已结束', icon: 'none', })
  },

  // 请求数据库，获得该活动参与人员情况
  getParterList() {
    let { actInfo } = this.data

    wx.cloud.callFunction({
      name: 'parterFunc',
      data: {
        action: 'getParterList',
        actId: actInfo._id
      },
      success: res => {
        let users = res.result.data
        this.setData({ users })
      }
    })
  },

  delParterList (data) {
    console.log("delParterList", data)
    wx.cloud.callFunction({
      name: 'parterFunc',
      data: {
        action: 'delParterList',
        delArr: data
      },
      success: res => {
        console.log('delParterList', res)
      }
    })
  },

  updateParterList (data) {
    console.log("updateParterList", data)
    wx.cloud.callFunction({
      name: 'parterFunc',
      data: {
        action: 'updateParterList',
        addArr: data
      },
      success: res => {
        console.log('updateParterList', res)
      }
    })
  },
})