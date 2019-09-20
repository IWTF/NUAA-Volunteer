// miniprogram/pages/actDel/actDel.js
const util = require('../../utils/utils.js');
const app = 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scale: wx.getStorageSync("scale"),
    currentItemId: 0,
    showEdit: false,
    delArr: [],
    addArr: [],
    users: [
      {
        id: '161720229'
      },
      {
        id: '161720201'
      },
      {
        id: '161730129'
      },
    ],
    isOver: '',
    join: false
  },

  onLoad: function (options) {
    console.log(options)
    var params = JSON.parse(options.params)
    let { deadline, join } = params
    let date = util.formatDate(new Date())
    // deadline = '0'
    let isOver = date>deadline ? true:false

    this.setData({ isOver, join })
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
  edit () {
    switch (this.data.currentItemId) {
      case 0:
        console.log("跳转活动发布页面")
        break
      case 1:
        this.setData({ showEdit: true })
        console.log("管理报名成员")
        break
      default: break
    }
  },
  eidtDone () {
    let { addArr, delArr, users } = this.data

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
  
})