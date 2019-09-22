// pages/launch/launch.js
const util = require('../../utils/utils.js');
var app = getApp();

Page({
  data: {
    barHeight: wx.getStorageSync("barHight"),
    index: 0,
    name: "",
    stuId: '',
    content: "",
    selectTimes: [],
    timeDots: [
      {
        location: "西操",
        begT: "2019-7-12 09:12",
        endT: "2019-7-12 13:00"
      },
      {
        location: "体育馆",
        begT: "2019-7-12 09:12",
        endT: "2019-7-12 13:00"
      },
      {
        location: "樱花广场",
        begT: "2019-7-12 09:12",
        endT: "2019-7-12 13:00"
      },
    ]
  },

  onLoad: function () {
  },

  chooseItem (e) {
    let { index } = e.currentTarget.dataset
    let { selectTimes, timeDots } = this.data

    if (selectTimes.indexOf(index)>=0) {
      selectTimes.splice(index, 1)
      timeDots[index].addSelect = false
    } else {
      selectTimes.push(index)
      timeDots[index].addSelect = true
    }
    this.setData({ selectTimes, timeDots })
  },

  // 表单提交函数
  formSubmit: function (e) {
    var that = this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let { name, stuId,  content } = e.detail.value;
    if (name == "" || stuId == "" || content == "") {
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
    } else {

    }
  },
})