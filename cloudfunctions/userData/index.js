// 云函数入口文件
/**
 * 特定用户活动信息获取
 * 1. getAllAct 获取该用户所有已认证活动
 * 2. 未开发，未使用
 * 3.
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
    case 'getCertifiedAct': return getCertifiedAct(event)
    case 'getParticipateAct': return getParticipateAct(event)
    case 'updateAct': return updateAct(event)
  }
}

async function getCertifiedAct(event) {
  const stuId = event.stuId

  try {
    return await db.collection('registerInfo').limit(200)
    .where(_.or([
      {
        stuId: stuId,
        certified: true
      },
      {
        stuId: parseInt(stuId),
        certified: "true"
      }
    ])).orderBy('verifyTime','desc').get()
  } catch (e) {
    console.error(e)
  }
}

async function getParticipateAct(event) {
  try {
    return await db.collection('registerInfo').where({
      _openid: event.openid
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