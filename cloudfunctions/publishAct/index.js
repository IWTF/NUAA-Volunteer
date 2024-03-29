// 云函数入口文件
/**
 * 活动信息 处理函数
 * 1. 活动的发布
 * 2. 活动内容的获取
 * 3. 活动内容的更新（待完善）
 */

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.action) {
    case 'publishAct': return publishAct(event)
    case 'getAct': return getAct(event)
    case 'updateAct': return updateAct(event)
    case 'delAct': return delAct(event)
  }
}

async function publishAct(event) {
  let { formData } = event
  try {
    return await db.collection('activities').add({
      data: formData
    })
  } catch (e) {
    console.error(e)
  }
}

async function getAct(event) {
  try {
    return await db.collection('activities').where({
      _id: event._id
    }).get()
  } catch (e) {
    console.log(e)
  }
}

async function updateAct(event) {
  try {
    return await db.collection('activities').doc(event.actId).set({
      data: event.formData
    })
  } catch (e) {
    console.log(e)
  }
}

async function delAct(event) {
  try {
    return await db.collection('activities').where({
      _id: event._id
    }).remove()
  } catch (e) {
    console.log(e)
  }
}