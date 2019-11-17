// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  // console.log(event)
  switch (event.action) {
    case 'signOutMsg': {
      return sendSignOutMsg(event)
    }
    case 'getWXACode': {
      return getWXACode(event)
    }
    case 'getOpenData': {
      return getOpenData(event)
    }
    default: {
      return
    }
  }
}

async function sendSignOutMsg(event) {
  let { msgInfo } = event
  console.log("msgInfo", msgInfo)
  const templateId = '8wjNmGWbYnpEa_d1cYgVYmF8fCRFo8vgQ_4EoI8CUF4'

  const sendResult = await cloud.openapi.templateMessage.send({
    touser: event.publisherId,
    templateId,
    formId: event.formId,
    data: {
      keyword1: {
        value: msgInfo.username,
      },
      keyword2: {
        value: msgInfo.actname,
      },
      keyword3: {
        value: msgInfo.time,
      },
      keyword4: {
        value: msgInfo.place,
      }
    }
  })

  return sendResult
}

async function getWXACode(event) {

  // 此处将获取永久有效的小程序码，并将其保存在云文件存储中，最后返回云文件 ID 给前端使用

  const wxacodeResult = await cloud.openapi.wxacode.get({
    path: 'pages/openapi/openapi',
  })

  const fileExtensionMatches = wxacodeResult.contentType.match(/\/([^\/]+)/)
  const fileExtension = (fileExtensionMatches && fileExtensionMatches[1]) || 'jpg'

  const uploadResult = await cloud.uploadFile({
    // 云文件路径，此处为演示采用一个固定名称
    cloudPath: `wxacode_default_openapi_page.${fileExtension}`,
    // 要上传的文件内容可直接传入图片 Buffer
    fileContent: wxacodeResult.buffer,
  })

  if (!uploadResult.fileID) {
    throw new Error(`upload failed with empty fileID and storage server status code ${uploadResult.statusCode}`)
  }

  return uploadResult.fileID
}

async function getOpenData(event) {
  // 需 wx-server-sdk >= 0.5.0
  return cloud.getOpenData({
    list: event.openData.list,
  })
}
