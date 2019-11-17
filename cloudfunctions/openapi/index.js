// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const execTasks = []; // 待执行任务栈
  // 1.查询是否有定时任务。（timeingTask)集合是否有数据。
  let taskRes = await db.collection('timeingTask').limit(100).get()
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
        // 定时任务数据库中删除该任务
        await db.collection('timeingTask').doc(tasks[i]._id).remove()
      }
    }
  } catch (e) {
    console.error("for循环err", e)
  }

  for (let i = 0; i < execTasks.length; i++) {
    let task = JSON.stringify(execTasks[i])
    const setClock = require('setClock.js')
    try {
      await setClock.kai(task)
    } catch (e) {
      console.error(e)
    }
  }
}

