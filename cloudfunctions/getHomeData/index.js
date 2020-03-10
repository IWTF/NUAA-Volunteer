// 云函数入口文件
/**
 * 首页活动 获取
 * 1. getDoingAct 获取正在进行的活动
 * 2. getDoneAct  获取已结束的活动
 * 3.
 */
const cloud = require('wx-server-sdk')
const util = require('./utils.js')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.action) {
    case 'getDoingAct': return getDoingAct()
    case 'getDoneAct': return getDoneAct(event)
  }
}

async function getDoingAct() {
  // 获取当前时间
  let now = util.formatDate(new Date()) + " " + util.formatTime(new Date())

  try {
    return await db.collection('activities').limit(200)
    .where({
      deadline: _.gt(now)
    }).get()
  } catch (e) {
    console.error(e)
  }
}

async function getDoneAct(event) {
  let year = event.year
  let month = parseInt(event.month)
  let begDate = year + '-' + util.formatNumber(month)

  let endMonth = month + 1;
  let endDate = year + '-' + util.formatNumber(endMonth)
  if (month == 12) {
    endMonth = 1
    let intYear = parseInt(year) + 1;
    endDate = intYear + '-' + util.formatNumber(endMonth)
  }

  let date = new Date();
  let nowMonth = date.getMonth() + 1
  if (month == nowMonth) { // 如果是最近一次的已结束志愿活动查询
    let day = date.getDate()
    endDate = year + '-' + util.formatNumber(nowMonth) + '-' + util.formatNumber(day)
  }

  console.log("getDone: ", begDate, endDate)

  try {
    return await db.collection('activities').where(_.and([
      {
        deadline: _.gt(begDate)
      },
      {
        deadline: _.lt(endDate)
      }
    ])).get()
  } catch (e) {
    console.log(e)
  }
}