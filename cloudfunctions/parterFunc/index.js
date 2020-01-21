// 云函数入口文件
/**
 * parterFunc
 * 参与人员管理函数
 * 1. 查询    2. 删除    3. 更新参与状态
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
    case 'getParterList': return getParterList(event)
    case 'delParterList': return delParterList(event)
    case 'updateParterList': return updateParterList(event)
  }
}

async function getParterList(event) {
  try {
    return await db.collection('registerInfo').where({
      actId: event.actId,
    }).get()
  } catch (e) {
    console.error(e)
  }
}

async function delParterList(event) {
  try {
    return await db.collection('registerInfo').where({
      _id: _.in(event.delArr)
    }).remove()
  } catch (e) {
    console.error(e)
  }
}

async function updateParterList(event) {
  try {
    return await db.collection('registerInfo').where({
      _id: _.in(event.addArr)
    }).update({
      data: {
        certified: true,
        verifyTime: event.currentDate
      }
    })
  } catch (e) {
    console.error(e)
  }
}
