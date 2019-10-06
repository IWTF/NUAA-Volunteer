// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 模板消息ID
const templateId = "ryAhs9vAc5DXRk3QcmVje1H6A6qqESw3FX02LfliUBY"

// 云函数入口函数
exports.main = async (event, context) => {
  const execTasks = []; // 待执行任务栈
  // 1.查询是否有定时任务。（timeingTask)集合是否有数据。
  let taskRes = await db.collection('timeingTask').limit(100).get()
  let tasks = taskRes.data;
  // 2.定时任务是否到达触发时间。只触发一次。
  let now = new Date();
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

  for (let i = 0; i < execTasks.length; i++) {
    try {
      await sendTemplate(execTasks[i])
    } catch (e) {
      console.error(e)
    }
  }
}


async function sendTemplate(params) {
  cloud.openapi.templateMessage.send({
    touser: params.openid,
    templateId,
    formId: params.formId,
    page: 'pages/openapi/openapi',
    data: {
      keyword1: {
        value: parmas.username,
      },
      keyword2: {
        value: parmas.name,
      },
      keyword3: {
        value: parmas.begT,
      },
      keyword4: {
        value: params.location,
      },
    }
  })
}