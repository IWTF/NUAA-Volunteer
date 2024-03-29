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
    first: true,
    unfold: true,
  },

  /**
   * onload
   * @param {actInfo，join} options 
   */
  onLoad: function (options) {
    // 开启页面转发
    wx.showShareMenu({
      withShareTicket: true
    })

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
    util.changeSkin(isOver, join);
    this.setData({ isOver, join, actInfo })
  },

  /**
   * 用户授权检测
   */
  onShow() {
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == '') { // 未设置缓存
      wx.showModal({
        title: '信息绑定',
        content: '绑定信息后才能进行活动报名',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../userInfo/userInfo',
            })
          } else if (res.cancel) {
            wx.navigateBack()
          }
        }
      })
      this.setData({ login: false, userInfo })
    } else {
      // 构造报名/分享按钮所需的 数据
      let { actInfo } = this.data;
      let params1 = JSON.stringify(actInfo);
      let t = {
        actName: actInfo.name,
        detail: true,
      }
      let params2 = JSON.stringify(t);
      
      this.setData({ login: true, userInfo, params1, params2 })
    }
  },

  /**
   * 更改 【顶部tab】 选项 
   */ 
  changeTab(e) {
    let tab = e.target.dataset.index
    this.setData({ currentItemId: tab })

    if (this.data.first && tab == 1) {
      this.getParterList()
      this.setData({ first: false })
    }
  },

  /**
   * 滚动swiper触发事件，改变tab样式
   */
  scrollChange(e) {
    this.setData({ currentItemId: e.detail.current })

    if (this.data.first && e.detail.current == 1) {
      this.getParterList()
      this.setData({ first: false })
    }
  },

  /**
   * 请求数据库，获得该活动参与人员情况
   */
  getParterList() {
    wx.showLoading({
      title: '加载中...'
    })
    
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
        wx.hideLoading()
      }
    })
  },

  /**
   * 删除参与人员；辅助函数
   * @param data 
   */
  delParterList(data) {
    wx.cloud.callFunction({
      name: 'parterFunc',
      data: {
        action: 'delParterList',
        delArr: data
      },
      success: res => {
        wx.hideLoading()
      }
    })
  },

  /**
   * 更新数据库记录，讲certified改为true
   */ 
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
        // console.log('updateParterList', res)
        wx.hideLoading()
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
    let that = this
    switch (this.data.currentItemId) {
      case 0:
        wx.showModal({
          title: "提示",
          content: "是否要删除该活动(不支持修改)",
          success(res) {
            if (res.confirm) {
              let actId = that.data.actInfo.actId
              if (!actId)
                actId = that.data.actInfo._id
              console.log("fadsfadsf", actId)
              wx.showLoading({ title: '删除中....' })
              wx.cloud.callFunction({
                name: 'publishAct',
                data: {
                  action: 'delAct',
                  _id: actId
                },
                success: res => {
                  wx.hideLoading({})
                  wx.navigateBack()
                },
              })
            } else if (res.cancel) {
              return
            }
          }
        })
        // wx.navigateTo({
        //   url: '../actPublish/actPublish?actId=' + actId,
        // })
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
            wx.showLoading({
              title: '更新中...'
            })
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
      // map函数返回一个新的Array，这里可以直接为newDel赋值 || 当然，也可以使用filter函数
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

    // console.log("before ============")
    // console.log("addArr", addArr)
    // console.log("showData:", showData)

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
})