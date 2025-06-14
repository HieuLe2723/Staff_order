// src/utils/date.js
const moment = require('moment-timezone');
require('dotenv').config();

const TIMEZONE = process.env.TIMEZONE || 'Asia/Ho_Chi_Minh';

class DateUtils {
  static formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date || !moment(date).isValid()) {
      throw new Error('Ngày giờ không hợp lệ');
    }
    return moment(date).tz(TIMEZONE).format(format);
  }

  static getCurrentDateTime() {
    return moment().tz(TIMEZONE).toDate();
  }

  static calculateTimeDifference(startDate, endDate) {
    if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
      throw new Error('Ngày giờ không hợp lệ');
    }
    const start = moment(startDate).tz(TIMEZONE);
    const end = moment(endDate).tz(TIMEZONE);
    return moment.duration(end.diff(start)).asMinutes();
  }

  static isDateInFuture(date) {
    if (!moment(date).isValid()) {
      throw new Error('Ngày giờ không hợp lệ');
    }
    return moment(date).tz(TIMEZONE).isAfter(this.getCurrentDateTime());
  }
}

module.exports = DateUtils;