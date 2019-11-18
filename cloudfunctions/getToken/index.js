const cloud = require('wx-server-sdk')
const rq = require('request-promise')
const APPID = 'wx986f698bf0a87c1f';
const APPSECRET = 'f6c6fdff5a5a3283710e9041df03a8ef';
const COLLNAME = 'publicField';
const FIELDNAME = 'ACCESS_TOKEN'

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    let res = await rq({
      method: 'GET',
      uri: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + APPSECRET,
    });
    res = JSON.parse(res)
    console.log("Volunteer result: ", res)

    let resUpdate = await db.collection(COLLNAME).doc(FIELDNAME).update({
      data: {
        token: res.access_token
      }
    })
  } catch (e) {
    console.error(e)
  }
}