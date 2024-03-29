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
    showTextView: false,
    tempValue: "备注"
  },

  onLoad: function (options) {
    // 获取用户信息，方便自动设置 用户 信息
    let userInfo = wx.getStorageSync('userInfo')

    let params = JSON.parse(options.params)
    this.setData({ params, userInfo,
      publisherId: params.openid
    })

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

  /**
   * 【表单提交函数】
   * 1. 获取表单数据，并进行验证
   * 2. 之后调用signFunc报名函数，进行报名
   * @param {object} e 
   */
  formSubmit: function (e) {
    var that = this;
    // console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let { selectTimes, params } = this.data
    let { content } = e.detail.value

    if (selectTimes.length === 0) {
      wx.showToast({ title: '请选择要参加的时间段', icon: 'none' })
      return
    }
    
    wx.showLoading({
      title: '报名中...',
    })

    let formData = { content, selectTimes }
    let promise = this.signFunc(formData)
    promise.then(res => {
      wx.setStorageSync('updateJoinList', true)
      
      // 关闭加载提示
      wx.hideLoading()

      // 自动跳回首页
      wx.navigateBack({ delta: 2 })
      wx.showToast({ title: '报名成功', duration: 2500 })
    }).catch(err => {
      let tmp = err.split(" ")
      let info = tmp[1] + " " + tmp[2] + " TO " + tmp[3] + " " + tmp[4] + " 已报满"
      // this.updateData()
      wx.showModal({
        title: '提示',
        content: info,
      })
    })
  },

  signFunc (e) {
    let { timeDots, params, userInfo, publisherId } = this.data
    const db = wx.cloud.database()
    let isFull = false

    return new Promise(function(resolve, reject) {
      for (let i=0; i<e.selectTimes.length; i++) {
        let timeDot = timeDots[e.selectTimes[i]]
        let category = timeDot.location + " " + timeDot.begT + " " + timeDot.endT

        let formInfo = {
          // 参加者基本信息
          username: userInfo.username,
          stuId: userInfo.stuId,
          content: e.content,
          // 报名时间段的信息
          actInfo: timeDot,
          category,   // timeDot的简写，方便之后对报名者分类
          // 常用活动信息的抽取，方便其他页面渲染/渲染页面的数据形式统一！
          actId: params._id,
          name: params.name,
          deadline: params.deadline,
          // 是否认证标识
          certified: false,
          verifyTime: '',
          duration: timeDot.duration,
          publisherId,
        }
        
        db.collection('registerInfo').where({
          category: category
        }).count({
          success: function (res) {
            if (res.total >= timeDot.num) {
              reject(category)
            } else {
              db.collection('registerInfo').add({
                data: formInfo
              })
              resolve()
            }
          }
        })
      }
    })
  },

  // 对 剩余 人数进行更新
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
        this.setData({ timeDots: res.result.data[0].timeDots })
      }
    })
  },

  // 输入框聚焦问题
  showTextView() {
    this.setData({ showTextView: true })
  },

  // 失焦时，隐藏textview
  // 失焦时，隐藏textview
  hideTextView (e) {
    let content = e.detail.value
    if (content == "") {
      content: "备注"
    }
    this.setData({
      showTextView: false,
      tempValue: content,
     })
  },

  // 输入框聚焦问题
  showTextView () {
    this.setData({ showTextView:true })
  },
})