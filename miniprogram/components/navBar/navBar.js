// components/navBar/navBar.js
Component({
  properties: {
    barTil: {
      type: String,
      value: "石榴青青"
    },
    backIcon: {
      type: Boolean,
      value: false
    },
    backUrl: {
      type: String,
      value: ""
    }
  },
  externalClasses: ['my-class'],
  data: {
    scale: wx.getStorageSync("scale"),
    barHight: wx.getStorageSync("barHight")
  },
  lifetimes: {
    ready() {
    },
  },
  methods: {
    navBack () {
      let { backUrl } = this.properties
      
      if (backUrl == "") {
        wx.switchTab({ url: '/pages/actList/actList', })
      } else {
        wx.navigateBack({ delta: 1 })
      }
    }
  }
})
