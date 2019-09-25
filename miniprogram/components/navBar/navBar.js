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
      type: Number,
      value: 1
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
      
      wx.navigateBack({ delta: backUrl })
    }
  }
})
