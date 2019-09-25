// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

const request = require('request');
const cheerio = require('cheerio');
const breakfast = 'http://www.5ikfc.com/mdl/menu/breakfast/';  //早餐
let breakfastList = [];

const db = cloud.database();

function maidanglaoSpider(http, list) {
  return new Promise((resolve, reject) => {
    request(http,
      (err, res) => {
        if (err) {
          reject('net error');
        }
        if (!err) {
          const body = res.body;
          const $ = cheerio.load(body, {
            decodeEntities: false
          })
          $('.lside.fr.bdgrey.main_wrap .fx li')
            .each(function () {
              const img = $('a img', this).attr('src');
              const name = $('a', this).text().trim();
              const price = $('b', this).text().trim();
              list.push({
                name,
                img,
                price
              })
              console.log({
                name,
                img,
                price
              })
            })
          resolve(list);
        }
      })
  })
}

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {
  console.log(event)
  console.log(context)

  // const breakfastData = await maidanglaoSpider(breakfast, breakfastList);
  // console.log("===================", breakfastData)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID
  }
}
