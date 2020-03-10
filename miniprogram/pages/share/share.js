const app = getApp();
Page({
  data: {
    detail: true,
    actName: "志愿活动",
    isStampChecked: 0,
    isEnvelopeChecked: 0,
    isFocusChecked: 0,
    copyrightText: '一起来做志愿活动吧~',
    nickName: '石榴青青',
    logo: '/images/icon-logo-water.png',
    stampWater: '/images/icon-stampWater.png',
    focusImg: '/images/focusImg-00.png',
    stampImg: '/images/icon-stamp-00.png',
    envelopeBg: '#7db3cb',
    envelopeBgData: [
      { bg: '#7db3cb' },
      { bg: '#f9908a' },
      { bg: '#78899e' },
      { bg: '#62ad98' },
      { bg: '#fde0b4' },
      { bg: '#b8a690' },
      { bg: '#d08e76' },
      { bg: '#fffdf7' }
    ],
    focusImgData: [
      { bg: '/images/focusImg-00.png'},
      { bg: '/images/focusImg-01.png' },
      { bg: '/images/focusImg-02.png' },
      { bg: '/images/focusImg-03.png' },
      { bg: '/images/focusImg-04.png' },
      { bg: '/images/focusImg-05.png' },
      { bg: '/images/focusImg-06.png' },
      { bg: '/images/focusImg-07.png' },
      { bg: '/images/focusImg-08.png' }
    ],
    stampImgData: [
      { bg: '/images/icon-stamp-01.png' },
      { bg: '/images/icon-stamp-02.png' },
      { bg: '/images/icon-stamp-03.png' },
      { bg: '/images/icon-stamp-04.png' }
    ],
    posterShow: true,
    isPic: false,
    isReady: true
  },

  onLoad (options) {
    let userInfo = wx.getStorageSync('userInfo');
    this.setData({ nickName: userInfo.username });

    let params = JSON.parse(options.params);
    console.log(params)
    if (params.detail) {
      this.setData({
        actName: params.actName,
        detail: params.detail,
      })
    }
  },

  // 选择邮票
  chooseStampImg: function (e) {
    const _that = this;
    const dataSet = e.currentTarget.dataset;
    const stampImg = dataSet.stamp;
    const isStampChecked = dataSet.index;
    _that.setData({
      stampImg,
      isStampChecked
    })
  },
  // 明信片图案
  chooseFocusImg: function (e) {
    const _that = this;
    const dataSet = e.currentTarget.dataset;
    const focusImg = dataSet.img;
    const isFocusChecked = dataSet.index;
    _that.setData({
      focusImg,
      isFocusChecked,
    })
  },
  // 明信片颜色
  chooseEnvelopeBg: function (e) {
    const _that = this;
    const dataSet = e.currentTarget.dataset;
    const envelopeBg = dataSet.bg;
    const isEnvelopeChecked = dataSet.index;
    _that.setData({
      envelopeBg,
      isEnvelopeChecked,
    })
  },

  /**
   * 
   * 处理海报
   * 
   */

  /**
   * 生成分享图
  */
  getSharePoster: function () {
    const _that = this
    wx.showLoading({
      title: '努力生成中...'
    });
    if (_that.data.isReady) {
      _that.toDrawCanvas();
      // 延迟300毫秒后截取已生成的海报
      setTimeout(() => {
        const currentPosterData = _that.data.currentPosterData; // 海报基础数据
        const canvasW = 690; // 画布 宽
        const canvasH = 520; // 画布 高
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: canvasW,
          height: canvasH,
          destWidth: canvasW,
          destHeight: canvasH,
          canvasId: 'shareImg',
          success: function (res) {
            _that.setData({
              prurl: res.tempFilePath,
              posterShow: false
            })
            wx.hideLoading()
          },
          fail: function (res) {
            console.log(res)
          }
        })
      }, 300)
    }
  },

  /**
   * 保存到相册
  */
  savePoster: function () {
    var _that = this;
    //生产环境时 记得这里要加入获取相册授权的代码
    wx.saveImageToPhotosAlbum({
      filePath: _that.data.prurl,
      success(res) {
        wx.showToast({
          title: '图片已保存',
          icon: 'success',
          duration: 2000
        });
        _that.setData({
          posterShow: true
        });
      }
    })

  },

  /**
   * 用户点击遮罩层
   */ 
  changePosterShow () {
    this.setData({
      posterShow: true
    })
  },
  // 给生成的img设置空点击事件，避免点击事件的上传调用changePosterShow
  preventMask () {},

  // 保存操作
  saveImg() {
    let _that = this;
    wx.getSetting({
      success: function (res) {
        //不存在相册授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: function () {
              _that.savePoster();
              _that.setData({
                isPic: false
              })
            },
            fail: function (err) {
              //console.log('请开启相册授权，否则无法将图片保存在相册中！');
              wx.showToast({
                title: '请开启相册授权，否则无法将图片保存在相册中！',
                icon: 'none',
                duration: 2000
              });
              _that.setData({
                isPic: true
              })
            }
          })
        } else {
          //console.log('存在相册授权');
          _that.savePoster();
        }
      }
    });

  },

  // 获取用户授权-保存相册
  handleSetting(e) {
    var that = this;
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
        content: '不授权无法保存',
        showCancel: false
      })
      that.setData({
        isPic: true
      })
    } else {
      that.setData({
        isPic: false
      })
    }
  },

  // 绘制 明信片海报
  toDrawCanvas: function () {
    const _that = this;
    const _data = _that.data;
    const ctx = wx.createCanvasContext('shareImg');
    const detail = _data.detail;
    const actName = _data.actName; // 昵称
    const nickName = _data.nickName; // 昵称
    const stampWater = _data.stampWater;
    const focusImg = _data.focusImg;
    const stampImg = _data.stampImg;
    const envelopeBg = _data.envelopeBg;
    const logo = _data.logo;

    // 背景颜色 - 1
    ctx.setFillStyle('#f1f1f1')
    ctx.fillRect(0, 0, 690, 520)

    // 彩条 边框 #0098eb
    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -600)
    ctx.lineTo(800, 100)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -550)
    ctx.lineTo(800, 150)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -500)
    ctx.lineTo(800, 200)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -450)
    ctx.lineTo(800, 250)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -400)
    ctx.lineTo(800, 300)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -350)
    ctx.lineTo(800, 350)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -300)
    ctx.lineTo(800, 400)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -250)
    ctx.lineTo(800, 450)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -200)
    ctx.lineTo(800, 500)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -150)
    ctx.lineTo(800, 550)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -100)
    ctx.lineTo(800, 600)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, -50)
    ctx.lineTo(800, 650)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 0)
    ctx.lineTo(800, 700)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 50)
    ctx.lineTo(800, 750)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 100)
    ctx.lineTo(800, 800)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 150)
    ctx.lineTo(800, 850)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 200)
    ctx.lineTo(800, 900)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 250)
    ctx.lineTo(800, 950)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 300)
    ctx.lineTo(800, 1000)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 350)
    ctx.lineTo(800, 1050)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 400)
    ctx.lineTo(800, 1100)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 450)
    ctx.lineTo(800, 1150)
    ctx.stroke()

    ctx.beginPath()
    ctx.setLineWidth(20)
    ctx.setStrokeStyle(envelopeBg)
    ctx.moveTo(-20, 500)
    ctx.lineTo(800, 1200)
    ctx.stroke()

    // 伪装边框圆角 1-1
    ctx.setLineWidth(20);
    ctx.setLineJoin('round')
    ctx.setStrokeStyle('#fffdf7')
    ctx.strokeRect(20, 20, 650, 480)
    
    // 背景颜色 1-2
    ctx.setFillStyle('#fffdf7')
    ctx.fillRect(30, 30, 630, 460)

    // 伪装边框圆角 2-1
    ctx.setLineWidth(20);
    ctx.setLineJoin('round')
    ctx.setStrokeStyle(envelopeBg)
    ctx.strokeRect(50, 50, 590, 270)
    
    // 背景颜色 2-2
    ctx.setFillStyle(envelopeBg)
    ctx.fillRect(60, 60, 570, 250)
    ctx.save()

    // 文本类 - 辅助横线
    ctx.beginPath()
    ctx.setLineCap('round')
    ctx.setStrokeStyle('#d9d2c8')
    ctx.setLineWidth(6)
    ctx.moveTo(50, 370)
    ctx.lineTo(85, 370)
    ctx.stroke()

    // 绘制用户昵称 - 来自: XXX 的邀请
    let mWidth_1 = 0;
    if (!detail) { // 如果来自detail页面，则不绘制来自
      ctx.setFillStyle('#969695');
      ctx.font = 'normal bold 24px fontlk';
      const metrics_1 = ctx.measureText('来自:');
      mWidth_1 = metrics_1.width;
      ctx.fillText('来自:', 50, 410)
    }

    let focusTxt = nickName;
    if (detail) focusTxt = actName;
    ctx.setFillStyle('#66523d');
    ctx.font = 'normal bold 30px fontlk';
    const metrics_2 = ctx.measureText(focusTxt);
    const mWidth_2 = metrics_2.width;
    ctx.fillText(focusTxt, 60 + mWidth_1, 410)

    let lastTxt = "的邀请";
    if (detail) lastTxt = "期待你的参与~";
    ctx.setFillStyle('#969695');
    ctx.font = 'normal bold 24px fontlk';
    ctx.fillText(lastTxt, 70 + mWidth_1 + mWidth_2, 410)
    ctx.save()

    // 绘制 水印
    ctx.setFillStyle('#999');
    ctx.setFontSize('18');
    if (detail) {
      ctx.fillText('By: '+nickName, 62, 450)
    } else {
      ctx.drawImage(logo, 50, 430, 25, 25)
      ctx.fillText(_data.copyrightText, 85, 450)
    }
    ctx.restore()
    

    ctx.drawImage(stampImg, 540, 50, 100, 140); // 绘制 邮票
    ctx.drawImage(stampWater, 525, 150, 105, 70); // 绘制 邮戳
    ctx.drawImage(focusImg, 60, 70, 425, 260); // 绘制 海报

    ctx.draw();
  },

})