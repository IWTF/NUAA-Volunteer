const cloud = require('wx-server-sdk');
/**
 * 订阅消息的发送
 * 1. 活动开始通知定时发送
 */

exports.main = async (event, context) => {
  cloud.init();
  const db = cloud.database();

  try {
    const execTasks = []; // 待执行任务栈
    // 1.从云开发数据库中查询等待发送的消息列表。（messages)集合是否有数据。
    let taskRes = await db.collection('messages').limit(100).get()
    let tasks = taskRes.data;

    // 获取当前时间
    let util = require('./utils.js')
    let now = util.formatDate(new Date()) + " " + util.formatTime(new Date())

    // 2.定时任务是否到达触发时间。只触发一次。
    try {
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].execTime <= now) { // 时间到
          // 存入待执行任务栈
          execTasks.push(tasks[i]);
        }
      }
    } catch (e) {
      console.error("for循环err", e)
    }

    // 循环消息列表
    const sendPromises = execTasks.map(async message => {
      try {
        // 发送订阅消息
        await cloud.openapi.subscribeMessage.send({
          touser: message.touser,
          page: message.page,
          data: message.data,
          templateId: message.templateId,
        });
        // 发送成功后将消息删除
        return db
          .collection('messages')
          .doc(message._id)
          .remove();
      } catch (e) {
        return e;
      }
    });

    return Promise.all(sendPromises);
  } catch (err) {
    console.log(err);
    return err;
  }
};
