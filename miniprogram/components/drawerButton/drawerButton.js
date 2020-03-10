// components/drawerButton/drawerButton.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mainBtnIcon: {
      type: String,
      value: 'icon-jia'
    },
    items: {
      type: Array,
      value: [],
    },
    params1: { // 页面跳转所需要的参数
      type: String,
      value: '',
    },
    params2: { // 分享该活动所需要的数据
      type: String,
      value: '',
    },
    isOver: { type: Boolean,  value: false},
    join: { type: Boolean,  value: false },
  },

  /**
   * 组件的初始数据
   */
  data: {
    unfold: true,
  },

  lifetimes: {
    ready() {
      console.log("==================")
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    show () {
      let t = this.data.unfold;
      this.setData({
        unfold: !t,
      })
    },
    navToShare () {
      let params = this.properties.params2;
      wx.navigateTo({
        url: '../../pages/share/share?params=' + params,
      })
    },
    // 报名函数
    signUp () {
      let actInfo = this.properties.params1;
      wx.navigateTo({ url: '../../pages/actSign/actSign?params=' + actInfo })
    },
    // 提示活动已结束
    bindEnd () {
      wx.showToast({ title: '活动已结束', icon: 'none', })
    },
  }
})
