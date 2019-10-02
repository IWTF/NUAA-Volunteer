// pages/launch/launch.js
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
    tolNum: 0
  },

  onLoad: function (options) {
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
    // console.log('form发生了submit事件，携带数据为：', e.detail.value)

    var that = this;
    let { timeDots, tolNum } = this.data
    let { name, typ, deadline, deadlineTime, content } = e.detail.value;

    if (name == "" || content == "" || timeDots.length === 0) {
      wx.showToast({ title: '请把表单填写完整', icon: 'none' })
    } else {
      typ = this.data.kind[typ];
      deadline = deadline + " " + deadlineTime

      // 还需要再加两个字段： 报名人数，活动状态
      let act = { name, typ, deadline, timeDots, content, tolNum }
      wx.cloud.callFunction({
        name: 'publishAct',
        data: {
          action: 'publishAct',
          formData: act
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
    let { begYear, endYear, begTime, endTime, timeBarNum, timeDots, timeBarLoction, tolNum } = this.data
    let begT = begYear.split('-')[1] + '-' + begYear.split('-')[2] + ' ' + begTime
    let endT = endYear.split('-')[1] + '-' + endYear.split('-')[2] + ' ' + endTime
    let num = timeBarNum
    let location = timeBarLoction

    if (num == '' || location == '') {
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 记录活动可以报名的总人数，方便ActList页面展示
    tolNum = tolNum + num

    let timeDot = { begT, endT, num, location, joinNum: 0 }

    timeDots.push(timeDot)
    this.setData({
      tolNum,
      timeDots,
      showTimeBar: false,
      timeBarNum: "",
      timeBarLoction: ""
    })
    console.log(this.data.timeBarLoction)
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

  // 活动地点 输入框 监听函数
  timeBarLoctionChange(e) {
    this.setData({ timeBarLoction: e.detail.value })
  },
})