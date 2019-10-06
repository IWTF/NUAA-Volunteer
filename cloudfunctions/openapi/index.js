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
        execTasks.push(tasks[i]); // 存入待执行任务栈
        // 定时任务数据库中删除该任务
        await db.collection('timeingTask').doc(tasks[i]._id).remove()
      }
    }
  } catch (e) {
    console.error(e)
  }

  console.log("execTasks is: ", execTasks)

  
  for (let i = 0; i < execTasks.length; i++) {
    try {
      const result = await sendTemplate(execTasks[i])
    } catch (e) {
      console.error(e)
    }
  }
}


async function sendTemplate(params) {
  console.log("params is:", params)
  // 模板消息ID
  const templateId = "ryAhs9vAc5DXRk3QcmVje1H6A6qqESw3FX02LfliUBY"

  try {
    const result = cloud.openapi.templateMessage.send({
      touser: params._openid,
      templateId: templateId,
      formId: params.formId,
      page: 'pages/joinList/joinList',
      data: {
        keyword1: {
          value: params.stuId
        },
        keyword2: {
          value: params.name
        },
        keyword3: {
          value: params.begT
        },
        keyword4: {
          value: "西操"
        }
      }
    })
    console.log("result", result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
  
}