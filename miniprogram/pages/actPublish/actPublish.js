// pages/launch/launch.js
const util = require('../../utils/utils.js');
var app = getApp();

Page({
  data: {
    scale: wx.getStorageSync("scale"),
    index: 0,
    kind: [   // 发布类型
      "志愿活动","培训报名"
    ],
    deadline: "2018-07-08",
    imgUrl: "",
    name: "",
    place: "",
    content: "",
    timeDots: [],   // 时间段 数组，元素为对象{begT, endT, num}
    // 选择时间段 Bar 的数据
    showTimeBar: false,
    begYear: "",
    endYear: "",
    begTime: "09:00",
    endTime: "10:00",
    timeBarNum: "",
    timeBarLoction: ""
  },

  onLoad: function (options) {
    let date = util.formatDate(new Date())
    let time = util.formatTime(new Date())

    this.setData({
      date: date,
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
    var that = this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let { name, typ, place, dates, limit, num, content } = e.detail.value;
    if (name == "" || place == "" || (limit == true && num == "") || content == "") {
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
    } else {
      if (!limit) { num = '500'; }
      typ = this.data.kind[typ];
      if (dates == null) { dates = util.formatTime(new Date()); }
      var user = app.globalData.userInfo;

      this.setData({
        imgUrl: '',
        name: '',
        place: '',
        index: 0,
        dates: util.formatTime(new Date()),
        content: ''
      })

      if (limit) {
        this.setData({
          check: false
        })
      }
    }
  },

  // 时间段 设置 对应的一系列函数
  showTimeBar() {
    this.setData({ showTimeBar: true })
  },

  // 添加一个新的 时间段
  addTimeDot() {
    let { begYear, endYear, begTime, endTime, timeBarNum, timeDots } = this.data
    let begT = begYear.split('-')[1] + '-' + begYear.split('-')[2] + ' ' + begTime
    let endT = endYear.split('-')[1] + '-' + endYear.split('-')[2] + ' ' + endTime
    let num = timeBarNum

    if (num == '') {
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
      return
    }

    let timeDot = { begT, endT, num }

    timeDots.push(timeDot)
    this.setData({
      timeDots,
      showTimeBar: false,
      timeBarNum: ''
    })
  },

  // 删除选中的 时间段
  delTimeDot (e) {
    let { index } = e.target.dataset
    let { timeDots } = this.data

    timeDots.splice(index, 1)
    this.setData({ timeDots })
  },

  hideTimeBar() {
    this.setData({ showTimeBar: false })
  },

  // 遮罩层 禁止点击事件 ====================================
  myCatchTouch() {
    return ;
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