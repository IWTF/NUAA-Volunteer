// components/navBar/navBar.js

/*
* barTil:   导航栏的标题（默认为”石榴青年“
* backIcon: 导航栏是否具有返回按钮
* backUrl： 导航栏返回按钮，触发事件的返回层级（不同页面需传不同值）
* my-class：自定义类
*/
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
    barHight: wx.getStorageSync("barHight"),
    toolBar: wx.getStorageSync("toolBar")
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
