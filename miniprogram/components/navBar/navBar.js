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
  },
  lifetimes: {
    ready() {
    },
  },
  methods: {
    navBack () {
      if (this.properties.backUrl == "") {
        wx.switchTab({
          url: '/pages/actList/actList',
        })
      } else {
        // redict
      }
    }
  }
})
