// pages/launch/launch.js

/*
* 该页面对数据的更新在 云端 进行
*/

const util = require('../../utils/utils.js');
var app = getApp();

Page({
  data: {
    barHeight: wx.getStorageSync("barHight"),
    index: 0,
    kind: [   // 发布类型
      "志愿活动","培训报名"
    ],
    deadline: "2018-07-08",
    deadlineTime: "",
    imgUrl: "",
    name: "",
    place: "",
    content: "",
    timeDots: [],   // 时间段 数组，元素为对象{begT, endT, num, location}
    // 选择时间段 Bar 的数据
    showTimeBar: false,
    begYear: "",
    endYear: "",
    begTime: "09:00",
    endTime: "10:00",
    timeBarNum: "",
    timeBarLoction: "",
    tolNum: 0,
    showTextView: false,
    tempValue: "请输入活动内容"
  },

  onLoad: function (options) {
    if (options.actId) {
      wx.cloud.callFunction({
        name: 'publishAct',
        data: {
          action: 'getAct',
          _id: options.actId
        },
        success: res => {
          let preData = res.result.data[0]

          let time = preData.deadline.split(" ")

          this.setData({
            name: preData.name,
            typ: preData.typ,
            deadline: time[0],
            deadlineTime: time[1],
            timeDots: preData.timeDots,
            content: preData.content,
            actId: options.actId      // 用于在提交时判断是否是更新数据库
          })
        },
        fail: err => {
          console.log("==========", err)
        }
      })
    }

    let date = util.formatDate(new Date())
    let time = util.formatTime(new Date())

    this.setData({
      deadline: date,
      deadlineTime: time,
      begYear: date,
      endYear: date,
      begTime: time,
      endTime: time
    })
  },

  // 改变活动类型的 func
  kind_change: function (e) {
    this.setData({
      index: e.detail.value
    })
  },

  // 事件选择器 的集成函数
  time_change: function (e) {
    let { sort } = e.target.dataset;
    console.log(e.detail.value)
    switch(sort) {
      case 'deadline':
        this.setData({ deadline: e.detail.value })
        break
      case 'deadlineTime':
        this.setData({ deadlineTime: e.detail.value })
        break
      case 'begYear':
        this.setData({ begYear: e.detail.value })
        break
      case 'endYear':
        this.setData({ endYear: e.detail.value })
        break
      case 'begTime':
        this.setData({ begTime: e.detail.value })
        break
      case 'endTime':
        this.setData({ endTime: e.detail.value })
        break
      default: break
    }
  },

  // 表单提交函数
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)

    var that = this;
    let { timeDots, tolNum, actId } = this.data
    let { name, typ, deadline, deadlineTime, content } = e.detail.value
    let openid = wx.getStorageSync('openid')

    if (name == "" || content == "" || timeDots.length === 0) {
      wx.showToast({ title: '请把表单填写完整', icon: 'none' })
    } else {
      typ = this.data.kind[typ];
      deadline = deadline + " " + deadlineTime

      let action = "publishAct"
      if (actId) {  // 用于在提交时判断是否是更新数据库
        action = "updateAct"
      }

      // 还需要再加两个字段： 报名人数，活动状态
      let act = { name, typ, deadline, timeDots, content, tolNum, openid }
      wx.cloud.callFunction({
        name: 'publishAct',
        data: {
          action,
          actId,
          formData: act,
        },
        success: res => {
          wx.setStorageSync('updateJoinList', true)
          
          wx.showToast({ title: '发布成功' })
          that.setData({
            name: '',
            content: '',
            timeDots: [],
            index: 0,
          })
        },
        fail: err => {
          wx.showToast({ icon: 'none', title: '加载数据失败' })
        }
      })
    }
  },

  // 时间段 设置 对应的一系列函数
  showTimeBar() {
    this.setData({ showTimeBar: true })
  },

  // 添加一个新的 时间段
  addTimeDot() {
    let { begYear, endYear, begTime, endTime, timeBarNum, timeDots, timeBarLoction, tolNum, timeBarDuration } = this.data
    let begT = begYear + " " + begTime
    let endT = endYear + " " + endTime
    let num = timeBarNum
    let location = timeBarLoction
    let duration = timeBarDuration

    if (num == '' || location == '' || duration == '') {
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 记录活动可以报名的总人数，方便ActList页面展示
    tolNum = (tolNum-'0') + (num-'0')

    let timeDot = { begT, endT, num, location, joinNum: 0, duration }

    timeDots.push(timeDot)
    this.setData({
      tolNum,
      timeDots,
      showTimeBar: false,
      timeBarNum: "",
      timeBarLoction: "",
      timeBarDuration: ""
    })
  },

  // 删除选中的 时间段
  delTimeDot (e) {
    let { index } = e.currentTarget.dataset
    let { timeDots } = this.data

    console.log("del index is: ", index)
    timeDots.splice(index, 1)
    this.setData({ timeDots })
  },

  hideTimeBar() {
    this.setData({ showTimeBar: false })
  },

  // 限制人数 输入框 监听函数
  timeBarNumChange(e) {
    this.setData({ timeBarNum: e.detail.value })
  },

  timeBarDurationChange(e) {
    this.setData({ timeBarDuration: e.detail.value })
  },

  // 活动地点 输入框 监听函数
  timeBarLoctionChange(e) {
    this.setData({ timeBarLoction: e.detail.value })
  },

  // 输入框聚焦问题
  showTextView () {
    this.setData({ showTextView:true })
  },

  // 失焦时，隐藏textview
  hideTextView (e) {
    let content = e.detail.value
    if (content == "") {
      content: "请输入活动内容"
    }
    this.setData({
      showTextView: false,
      tempValue: content,
    })
  }
})