const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

const formatTime = data => {
  const hour = data.getHours()
  const minute = data.getMinutes()

  return [hour, minute].map(formatNumber).join(':')
}

const getBETime = data => {
  let beg = data[0].begT
  let end = data[0].endT

  for (let i=1; i<data.length; i++) {
    if (beg > data[i].begT) {
      beg = data[i].begT
    }
    if (end < data[i].endT) {
      end = data[i].endT
    }
  }

  return { beg, end }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatDate,
  formatTime,
  getBETime
}