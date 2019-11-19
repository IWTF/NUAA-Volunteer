// miniprogram/pages/actDel/actDel.js
const util = require('../../utils/utils.js');

/*
*  该页面  所有对数据库的操作  都在cloud进行
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

    // 数据结构设计的坑...要分情况（从不同页面跳转进来）赋值
    let acTime = {}
    if (actInfo.actInfo) {
      acTime = util.getBETime([actInfo.actInfo])
    } else {
      acTime = util.getBETime(actInfo.timeDots)
    }
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

  // 请求数据库，获得该活动参与人员情况
  getParterList() {
    let { actInfo } = this.data

    let actId = actInfo.tolNum ? actInfo._id : actInfo.actId
    // console.log("+++++++++++actId", actId)

    const db = wx.cloud.database()
    const $ = db.command.aggregate

    wx.cloud.callFunction({
      name: 'parterFunc',
      data: {
        action: 'getParterList',
        actId,
      },
      success: res => {
        // console.log("+++++++++++", res)
        let users = res.result.data
        let timeSet = new Set();
        for (let i = 0; i < users.length; i++) {
          timeSet.add(users[i].category)
        }
        timeSet = Array.from(timeSet)

        this.setData({ users, timeSet, selected: timeSet[0] })
        this.dataSort(timeSet[0])
      }
    })
  },

  delParterList(data) {
    console.log("delParterList", data)
    wx.cloud.callFunction({
      name: 'parterFunc',
      data: {
        action: 'delParterList',
        delArr: data
      },
      success: res => {
        // console.log('delParterList', res)
      }
    })
  },

  // 更新数据库记录，讲certified改为true
  updateParterList(data) {
    let currentDate = util.formatDate(new Date()) + " " + util.formatTime(new Date())

    wx.cloud.callFunction({
      name: 'parterFunc',
      data: {
        action: 'updateParterList',
        addArr: data,
        currentDate,
      },
      success: res => {
        console.log('updateParterList', res)
      }
    })
  },

  // 改变展示的集合
  changeSet() {
    this.setData({ dropDown: !this.data.dropDown })
  },

  // 下拉菜单选项变化
  dropChange (e) {
    let { index } = e.currentTarget.dataset
    let { timeSet } = this.data

    let selected = timeSet[index]
    this.dataSort(selected)
    this.setData({ selected, dropDown: false })
  },

  dataSort(sort) {
    let { users, showData } = this.data
    showData = users.filter((item) => sort === item.category )
    this.setData({ showData })
  },

  // 管理员 编辑页面； 控制跳转到对应的编辑页面【活动更改/人员认证】
  edit () {
    switch (this.data.currentItemId) {
      case 0:
        let actId = this.data.actInfo.actId
        if (!actId)
          actId = this.data.actInfo._id
        wx.navigateTo({
          url: '../actPublish/actPublish?actId=' + actId,
        })
        break
      case 1:
        this.setData({ showEdit: true })
        break
      default: break
    }
  },
  // 更改“完成”，向数据库提交
  async eidtDone () {
    let cancel = false

    await new Promise((resolve, reject) => {
      wx.showModal({
        title: '提示',
        content: '请确定认证信息无误，一经提交无法修改！',
        success(res) {
          if (res.confirm) {
            wx.setStorageSync('updateJoinList', true)
            resolve()
          } else if (res.cancel) {
            cancel = true
            resolve()
          }
        }
      })
    })

    if(cancel) {
      this.setData({ showEdit: false })
      return 
    }
   
    let { addArr, delArr, showData } = this.data

    // 更改报名人员列表，若有删除，则执行下面代码
    if (delArr.length > 0) {
      let newDel = []
      showData.map((item, index) => {
        if (delArr.indexOf(index) >= 0) {
          newDel.push(item._id)
        }
      })
      this.delParterList(newDel)
    }

    // 更改报名人员列表，若有认证，则执行下面代码
    if (addArr.length > 0) {
      let newAdd = []
      showData.map((item, index) => {
        if (addArr.indexOf(index) >= 0) {
          newAdd.push(item._id)
        }
      })
      this.updateParterList(newAdd)
    }

    // 原逻辑，更改后，认证和删除的均不在列表中显示
    // 仍有用，需要删除delete的成员
    // let arr = addArr.concat(delArr)
    // showData = showData.filter((item, index) => arr.indexOf(index) < 0);

    showData = showData.filter((item, index) => delArr.indexOf(index) < 0);

    console.log("before ============")
    console.log("addArr", addArr)
    console.log("showData:", showData)

    // 更改后，仍显示，只是状态发生了改变
    showData.map((item, index) => {
      if (addArr.indexOf(index) >= 0) {
        item.certified = true
      }
    })
    console.log("showData after: ", showData)

    this.setData({
      showEdit: false,
      showData
    })
  },

  // 添加/删除 参与成员
  addItem (e) {
    let { index } = e.currentTarget.dataset
    let { addArr, delArr, showData } = this.data

    

    if (addArr.indexOf(index) >= 0) {
      addArr.splice(addArr.indexOf(index), 1)
      showData[index].addSelect = false
    } else {
      if (delArr.indexOf(index) >= 0) {
        delArr.splice(delArr.indexOf(index), 1)
        showData[index].delSelect = false
      }
      addArr.push(index)
      showData[index].addSelect = true
      console.log("====", index)
    }
    this.setData({
      addArr,
      delArr,
      showData
    })
  },
  delItem (e) {
    console.log("Del Item")
    let { index } = e.currentTarget.dataset
    let { addArr, delArr, showData } = this.data

    if (delArr.indexOf(index) >= 0) {
      delArr.splice(delArr.indexOf(index), 1)
      showData[index].delSelect = false
    } else {
      if (addArr.indexOf(index) >= 0) {
        addArr.splice(addArr.indexOf(index), 1)
        showData[index].addSelect = false
      }
      delArr.push(index)
      showData[index].delSelect = true
    }
    this.setData({
      addArr,
      delArr,
      showData
    })
  },

  /* 报名/取消报名 

    这两个函数中，actInfo不需要做可以区分
    因为，活动列表页面不会触发这两个函数  
  */
  signUp () {
    let { actInfo } = this.data

    wx.navigateTo({ url: '../actSign/actSign?params=' + JSON.stringify(actInfo) })
  },


  async signOut (e) {
    let cancel = false
    let formId = e.detail.formId

    let { actInfo } = this.data
    let { publisherId, category } = actInfo
    let place = actInfo.category.split(" ")[0]
    let time = actInfo.category.split(" ")[1] + " " + actInfo.category.split(" ")[2] + "到" + actInfo.category.split(" ")[3] + " " + actInfo.category.split(" ")[4]
    
    // 整合 活动取消 的相关信息，用于模板发送
    let msgInfo = {
      username: actInfo.username,
      actname: actInfo.name,
      place,
      time,
    }
    

    await new Promise((resolve, reject) => {
      wx.showModal({
        title: '提示',
        content: '是否要取消报名',
        success(res) {
          if (res.confirm) {
            // 给管理员发送 活动取消 通知
            wx.cloud.callFunction({
              name: 'sendMsg',
              data: {
                msgInfo,
                publisherId,
                action: 'signOutMsg',
                formId: formId,
              },
              success: res => { },
              fail: err => { }
            })
            wx.setStorageSync('updateJoinList', true)
            resolve()
          } else if (res.cancel) {
            cancel = true
            resolve()
          }
        }
      })
    })
    
    if(cancel) {
      return
    }

    // let { actInfo } = this.data
    if (!actInfo.actInfo) {
      wx.showToast({ icon: 'none', title: '请到“我参与的”页面取消报名' })
      return
    }

    let id = actInfo._id
    
    wx.cloud.callFunction({
      name: 'parterFunc',
      data: {
        action: 'delParterList',
        delArr: [id]
      },
      success: res => {
        wx.setStorageSync('updateJoinList', true)

        wx.navigateBack({ delta: 1 })
        wx.showToast({ title: '已取消报名' })
      },
      fail: err => {
        wx.showToast({ icon: 'none', title: 'Error 请稍后重试' })
      }
    })

    // 设置缓存，提醒joinList页面跟新数据
    wx.setStorageSync('updateJoinList', true)
  },

  // 提示用户绑定个人信息
  bindInfo () {
    wx.showToast({ icon: 'none', title: '请先绑定个人信息' })
  },

  // 提示活动已结束
  bindEnd () {
    wx.showToast({ title: '活动已结束', icon: 'none', })
  },
})