// miniprogram/pages/actList/actList.js
const util = require('../../utils/utils.js');

Page({
  data: {
    scale: wx.getStorageSync("scale"),
    barHeight: wx.getStorageSync("barHight"),
    currentItemId: 0,
    publishBtnClass: 'publishBtnShow', // 发表按钮的显示样式类
    currentScrollTop: 0,
    showClock: false,     // 默认不显示设置闹钟页面
    reminders: [
      '提前一小时',
      '提前两小时',
      '提前一天'
    ],
  },

  onLoad: function (options) {
    wx.setStorageSync('updateJoinList', true)
  },

  onShow () {
    let openid = wx.getStorageSync('openid')
    
    // 这一部分也不需要了，不认证不能到达该页面
    // let userInfo = wx.getStorageSync('userInfo')
    // if (userInfo == '') { // 未设置缓存
    //   wx.showToast({ title: '请先绑定个人信息', icon: 'none' })
    //   this.setData({ login: false, userInfo })
    //   this.setData({ doingArr: [], doneArr: [] })
    //   return
    // } else {
    //   this.setData({ login: true, userInfo })
    // }

    let update = wx.getStorageSync('updateJoinList')
    if (update) {
      wx.setStorageSync('updateJoinList', false)
      this.initData(openid)
    }
    /*
    * 应该导致update值发生改变的操作：
    * 1. 报名参与
    * 2. 管理员活动认证
    * 3. 退出活动
    *
    * 该方法1，3可以控制刷新； 2没办法获悉
    * （不过没有影响，因为用户不知道管理员什么时候认证，不会影响体验）
    */
  },

  // 当页面刷新时，重修请求数据会出现错误。。。
  // 错误原因： openid没有存如data，但在update时直接使用了this.data.openid; 导致限制条件为null
  // 已修复
  onPullDownRefresh() {
    wx.showNavigationBarLoading()

    let openid = wx.getStorageSync('openid')
    let promise = this.initData(openid)
    promise.then(res => {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    })
  },

  initData (openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      let now = util.formatDate(new Date()) + " " + util.formatTime(new Date())

      db.collection('registerInfo').where({
        _openid: openid
      }).get({
        success: res => {
          // console.log("joinList data is:", res)
          let ret = res.data
          let doingArr = []
          let doneArr = []
          for (let i = 0; i < ret.length; i++) {
            let { beg, end } = util.getBETime([ret[i].actInfo,])
            if (now < end) {
              doingArr.push(ret[i])
            } else {
              doneArr.push(ret[i])
            }
          }
          this.setData({ doingArr, doneArr })
          resolve()
        }
      })
    })
  },

  // 更改 tab 选项
  changeTab(e) {
    // 这里不是 data- 传参，所以用target
    let tab = e.target.dataset.index
    this.setData({ currentItemId: tab })
  },
  // 滚动swiper触发事件，改变tab样式
  scrollChange(e) {
    this.setData({ currentItemId: e.detail.current })
  },

  // 跳转传参，进入相应del
  navToDel(e) {
    let index = e.currentTarget.dataset.index
    let { doingArr } = this.data
    // 活动结束时间、参与情况、活动唯一id
    let tmParams = {
      actInfo: doingArr[index],
      join: true
    }
    let params = JSON.stringify(tmParams)

    wx.navigateTo({
      url: '../actDel/actDel?params=' + params,
    })
  },

  certified () {
    wx.showToast({ icon: 'none', title: '已认证' })
  },

  navToPublishNote() {
    wx.navigateTo({
      url: '../actPublish/actPublish',
    })
  },

  /**
   * 监听页面滑动
   */
  onPageScroll(res) {
    var top = res.scrollTop
    if (top >= this.data.currentScrollTop + 5) {
      this.setData({
        publishBtnClass: 'publishBtnHide',
        currentScrollTop: top
      })
    } else if (top <= this.data.currentScrollTop - 5) {
      this.setData({
        publishBtnClass: 'publishBtnShow',
        currentScrollTop: top
      })
    }
  },

  // 设置闹钟提醒
  showClock(e) {
    let { index } = e.currentTarget.dataset
    this.setData({ showClock: true, selectedAct: index })
  },

  hideClock() {
    // return
    this.setData({ showClock: false })
  },

  selectR (e) {
    // return
    let { index } = e.currentTarget.dataset
    this.setData({ selectedR: index })
  },

  setClock() {
    let { selectedAct, doingArr, selectedR, reminders } = this.data
    // 获取用户的openid
    let openid = wx.getStorageSync('openid')
    // 选中的活动
    let act = doingArr[selectedAct]
    // 选择的提醒时间
    let remind = reminders[selectedR]
    // 定义执行时间，获取活动开始时间，方面后续操作
    let execTime
    let begT = act.actInfo.begT

    if (!remind)
      return
    this.setData({ showClock: false })

    let before = 1
    switch (remind) {
      case "提前两小时":
        before = 2
      case "提前一小时":
        console.log("=============", begT)
        let t = begT.split(" ")[1].split(":")
        let begTime = t[0]
        let numTime = begTime[0]*10 + begTime[1]*1 - before
        numTime = util.formatNumber(numTime)
        execTime = begT.split(" ")[0] + " " + numTime + ":" + t[1]
        break
      case "提前一天":
        let d = begT.split(" ")[0].split("-")
        let begDate = d[2]
        let numDate = begDate[0] * 10 + begDate[1] * 1 - before
        numDate = util.formatNumber(numDate)
        execTime = d[0] + "-" + d[1] + "-" + numDate + " " + begT.split(" ")[1]
    }

    let item = {
      thing2: {
        value: '您报名的志愿活动即将开始',
      },
      thing4: {
        value: act.name,
      },
      date5: {
        value: act.actInfo.begT,
      },
      thing6: {
        value: act.actInfo.location,
      }
    }
    let actTmplId = "sJOzSV_I74jzrhqdUMBEa0s8vRleEgX0DhjX8eFDz9Y"
    wx.requestSubscribeMessage({
      tmplIds: [actTmplId],
      success (res) {
        // 申请订阅成功
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          // 这里将订阅的课程信息调用云函数存入云开发数据
          wx.cloud
            .callFunction({
              name: 'subscribe',
              data: {
                data: item,
                templateId: actTmplId,
                execTime,
              },
            })
            .then(() => {
              wx.showToast({
                title: '订阅成功',
                icon: 'success',
                duration: 2000,
              });
            })
            .catch(() => {
              wx.showToast({
                title: '订阅失败',
                icon: 'success',
                duration: 2000,
              });
            });
        }
      },
      fail (e) {
        console.log("error is: ", e)
        wx.showToast({ title: '请稍后重试', icon: 'none' })
      }
    })
    
  }
})