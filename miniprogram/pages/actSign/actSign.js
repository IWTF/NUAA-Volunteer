// pages/launch/launch.js
const util = require('../../utils/utils.js');
var app = getApp();

Page({
  data: {
    barHeight: wx.getStorageSync("barHight"),
    index: 0,
    name: "",
    stuId: "",
    content: "",
    selectTimes: [],
  },

  onLoad: function (options) {
    let params = JSON.parse(options.params)
    console.log("params is: ", params)
    this.setData({ params })

    this.getActData(params._id)
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
    let { selectTimes, params } = this.data
    let { name, stuId, content } = e.detail.value;

    if (name == "" || stuId == "" || content == "") {
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
    } else {
      let formData = { name, stuId, content, selectTimes }
      let promise = this.signFunc(formData)
      promise.then(res => {
        wx.setStorageSync(params._id, true)
        wx.navigateBack({ delta: 2 })
        wx.showToast({ title: '报名成功', duration: 2500 })
      }).catch(err => {
        this.updateData()
        wx.showToast({ icon: 'none', title: '已报满' })
      })
    }
  },

  signFunc (e) {
    let { timeDots, params } = this.data
    const db = wx.cloud.database()
    let isFull = false

    return new Promise(function(resolve, reject) {
      for (let i=0; i<e.selectTimes.length; i++) {
        let formInfo = {
          name: e.name,
          stuId: e.stuId,
          content: e.content,
          actInfo: timeDots[e.selectTimes[i]],
          actId: params._id,
          actName: params.name,
          certified: false
        }
        
        db.collection('registerInfo').where({
          actId: e.actId
        }).count({
          success: res => {
            isFull = res.total >= timeDots[e.selectTimes[i]].num
            console.log("compare: ", res.total, timeDots[e.selectTimes[i]].num, isFull)
          }
        })
        console.log("1234567890", isFull)
        if (isFull) {
          console.log("已经饱满")
          break
        }
          

        // console.log("++++++", formInfo)
        db.collection('registerInfo').add({
          data: formInfo
        })
      }
      if (isFull) {
        console.log("已经饱满")
        reject()
      }
      resolve()
    })
  },

  updateData () {
    let { params } = this.data
    this.getActData(params._id)
  },

  getActData (id) {
    wx.cloud.callFunction({
      name: 'publishAct',
      data: {
        action: 'getAct',
        _id: id
      },
      success: res => {
        console.log("重新刷新页面")
        this.setData({ timeDots: res.result.data[0].timeDots })
      }
    })
  }
})