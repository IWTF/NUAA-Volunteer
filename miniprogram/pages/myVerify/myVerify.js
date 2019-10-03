// miniprogram/pages/myVerify/myVerify.js
Page({

  data: {
    barHeight: wx.getStorageSync("barHight"),
    datalist: []
  },

  onLoad: function (options) {
    let that = this
    let openid = wx.getStorageSync('openid')

    const db = wx.cloud.database()

    db.collection('registerInfo').where({
      _openid: openid,
      certified: true
    }).get({
      success: res => {
        that.setData({ datalist: res.data })
      }
    })
  },

})