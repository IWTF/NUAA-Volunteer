// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  switch(event.action) {
    case 'addAdmin': return addAdmin(event)
    case 'delAdmin': return delAdmin(event)
  }
}

async function addAdmin(event) {
  console.log('addAdmin data: ', event)
  let { username, stuId, authority } = event
  try {
    return await db.collection('users').where({
      username: username,
      stuId: stuId
    }).update({
      data: {
        authority: authority
      }
    })
  } catch (e) {
    console.error(e)
  }
}

async function delAdmin(event) {
  let { delItemId } = event
  try {
    return await db.collection('users').where({
      _id: _.in(delItemId)
    }).update({
      data: {
        authority: 'user'
      }
    })
  } catch (e) {
    console.error(e)
  }
}