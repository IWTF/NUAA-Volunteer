/**
 * 订阅消息收集函数
 */
const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  switch (event.action) {
    case 'timing': return timing(event)
    case 'signout': return signout(event)
  }
};

async function timing(event) {
  try {
    const {OPENID} = cloud.getWXContext();
    // 在云开发数据库中存储用户订阅的课程
    return await db.collection('messages').add({
      data: {
        touser: OPENID, // 订阅者的openid
        page: 'pages/joinList/joinList', // 订阅消息卡片点击后会打开小程序的哪个页面
        data: event.data, // 订阅消息的数据
        templateId: event.templateId, // 订阅消息模板ID
        execTime: event.execTime,
      },
    });
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function signout(event) {
  try {
    return await db.collection('messages').add({
      data: {
        touser: event.openid,           // 活动发布者的openid
        page: 'pages/joinList/joinList', 
        data: event.data, // 订阅消息的数据
        templateId: event.templateId, // 订阅消息模板ID
        execTime: '1999-03-21 05:22',
      },
    });
  } catch (err) {
    console.log(err);
    return err;
  }
}