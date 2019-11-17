const cloud = require('wx-server-sdk')
const templateMessage = require('templateMessage.js')

const COLL_FIELD_NAME = 'publicField';
const FIELD_NAME = 'ACCESS_TOKEN'

const MSGID = 'ryAhs9vAc5DXRk3QcmVje9ZCJP6k-l5DABkx8O9__QA';

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

const kai = async task => {
  task = JSON.parse(task)
  console.log("======task======", task)
  // 根据活动id，获取参与用户信息，获取到用户的 openid 和 formid.

  // 开奖程序省略

  // 从数据库中获取AccessToken
  let tokenRes = await db.collection(COLL_FIELD_NAME).doc(FIELD_NAME).get();
  let token = tokenRes.data.token; // access_token

  let page = '点击模板消息，想要打开的小程序页面';
  let msgData = {
    "keyword1": {
      "value": task.stuId,
    },
    "keyword2": {
      "value": task.name,
    },
    "keyword3": {
      "value": task.begT,
    },
    "keyword4": {
      "value": task.location,
    }
  };

  let openid = task._openid;
  let formid = task.formId;

  await templateMessage.sendTemplateMsg(token, MSGID, msgData, openid, formid, page);
}

module.exports = {
  kai: kai,
}