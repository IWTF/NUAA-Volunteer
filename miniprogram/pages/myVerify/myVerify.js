// miniprogram/pages/myVerify/myVerify.js
Page({

  data: {
    barHeight: wx.getStorageSync("barHight"),
    datalist: []
  },

  onLoad: function (options) {
    let that = this
    let {stuId} = wx.getStorageSync('userInfo')

    const db = wx.cloud.database()
    const _ = db.command
    
    db.collection('registerInfo').where(_.or([
      {
        stuId: stuId,
        certified: true
      },
      {
        stuId: parseInt(stuId),
        certified: "true"
      }
    ])).orderBy('verifyTime', 'asc').get({
      success: res => {
        that.setData({ datalist: res.data })
      }
    })
  },

  changeOrder () {
    let { datalist } = this.data
    datalist.reverse()
    this.setData({ datalist })
  }

})