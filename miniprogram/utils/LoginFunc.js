const sha = require("./sha1.js")

const getUuid = async () => {
  const url = 'http://aao-eas.nuaa.edu.cn/eams/login.action'
  let ret = ''

  await new Promise((resolve) => {
    wx.request({
      url: url,
      header: {
        'content-type': 'text/html;charset=UTF-8'
      },
      success: res => {
        const reg = /\('[0-9a-zA-Z-]{36}-'/
        let uuid = reg.exec(res.data)[0]

        ret = uuid.replace("'", "").replace("(", "").replace("'", "")
        resolve()
      }
    })
  })

  console.log("return data is", ret)
  return ret
}

const loginPost = (uuid, userInfo) => {
  const url = "http://aao-eas.nuaa.edu.cn/eams/login.action"
  let data = JSON.parse(userInfo)

  data.password = sha.CryptoJS.SHA1(uuid + data.password).toString();

  console.log("userInfo is: ", data)
  // wx.request({
  //   url: url,
  //   method: 'POST',
  //   header: {
  //     'Origin': 'http://aao-eas.nuaa.edu.cn',
  //     "Content-Type": "application/ x - www - form - urlencoded",
  //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
  //   },
  //   data: {
  //     username: data.username,
  //     password: data.password  
  //   },
  //   success: res => {
  //     console.log("POST result is:", res)
  //   }
  // })
}

module.exports = {
  getUuid,
  loginPost
}