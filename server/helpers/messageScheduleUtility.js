const Template = require("../template/template.model");
const Notification = require("../notification/notification.model");
const MapTemplate = require("./mapWordsInTempalte");
const getTemplate = require("../helpers/get-template");
const crypto = require("crypto");

class MessageScheduleUtility {
  constructor(type, details, notification_id) {
    // console.log("MessageScheduleUtility---->>>>>>>>>>>>>>>>>>>>",details)
    this.type = type;
    this.details = details;
    this.notification_id = notification_id;
    this.bookingDate = this.details.bookingDate;
    this.rescheduleThreshold = this.details.rescheduleThreshold;
    this.reminderThreshold = this.details.reminderThreshold;
  }
  
  decrypt(data) {
    console.log("decrypt called:")
    try {
      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync('onetoone','salt', 24);
      const iv = Buffer.alloc(16, 0);
  
      // const cipher = crypto.createCipheriv(algorithm, key, iv);
      // const encrypt = cipher.update('passwordhere', 'utf8', 'hex') + cipher.final('hex');
      // console.log('encrypted', encrypt)
  
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      console.log("decipher:",decipher)
      const decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
      
      console.log("decrypted:",decrypted)
      return decrypted;
    }
    catch(e) {
      return data;
    }
  }
  
  async scheduleUtility(notificationFor, notificationType) {
    let notification_date = this.getDate(this.details.bookingTime, notificationFor);
    let notification_time = this.getTime(this.details.bookingTime, notificationFor);
    let template = await getTemplate(notificationFor,this.details.appId);
    let decryptedMeetingUrl = await this.decrypt(this.details.meeting_url);
    console.log("decryptedMeetingUrl--messageschedule...................",decryptedMeetingUrl)
    this.details.meeting_url = decryptedMeetingUrl;
    console.log("this.details.meeting_url--messageschedule...................",this.details.meeting_url)
    let obj = {
      userName : this.details.userName,
      bookingDate : this.details.bookingDate,
      meetingLink : this.details.meeting_url
    };
    let templateMessage = await MapTemplate(
      template[0].template,
      obj
    );
    // console.log(templateMessage +" templateMessage.messfescheduleutitlity mainnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn");
    let subject = template[0].subject;
    // console.log(subject+" sunject.messfescheduleutitlity ))))))))))))))))))))))))))))))");
    const ids = [];
    if(this.details.onesignal){
      for (let i = 0; i < this.details.onesignal.length; i++) {
        ids.push(this.details.onesignal[i].player_id);
      }
    }
    let storeNotification = await this.saveNotication(
      notificationType,
      templateMessage,
      "Pending",
      this.details,
      subject,
      this.notification_id,
      notification_date,
      notification_time,
      ids
    );
    // console.log(storeNotification+ "reference++++++++++++++++++++++++++++++++++++++");
    // console.log(storeNotification.templateMessage+" 888888888888888888888888888 templateMessage 9999999999999999999999999");
    return storeNotification;
  }

  getTime(notification_date, notificationFor) {
    let notification_date_time = this.convertToDateFormat(notification_date);
    if (notificationFor.includes("Booking_reminder")){
      return this.getfiveminless(notification_date_time,this.reminderThreshold);
    }
    // else if(notificationFor.includes("Booking_no_show")){
    //   return this.getplusfifteenmin(notification_date_time);
    // }
    else if (notificationFor.includes("Booking_reschedule_limit_reminder")){
      console.log("this.rescheduleThreshold--->>>>>>",this.rescheduleThreshold)
      return this.getReminderDateTime("time",notification_date_time,this.rescheduleThreshold);
    }
    else if (notificationFor === "Booking_followup_Ec_email" || "Booking_followup_email")
      return "09:00:00";

  }

  getDate(bookingTime, notificationFor) {
    let notification_date_temp = this.convertToDateFormat(bookingTime);
    if (notificationFor === "Booking_followup_Ec_email"){
        return this.getFollowupDate(notification_date_temp, 14);
    }
    else if (notificationFor.includes("Booking_reminder")){
      return this.getFollowupDate(notification_date_temp, 0);
    }
    else if (notificationFor === "Booking_followup_email"){
      return this.getFollowupDate(notification_date_temp, 21);
    }
    else if (notificationFor.includes("Booking_reschedule_limit_reminder")){
      let temp = this.rescheduleThreshold/24 ;
      return this.getFollowupDate(notification_date_temp, temp);
    }
    else return this.bookingDate;
  }

  convertToDateFormat(stringDate) {
    let date = stringDate.split(" ");
    let time = date[1];
    date = date[0];
    time = time.split(":");
    date = date.split("-");
    let month = Number(date[1]) - 1;
    let date_format;
    date_format = new Date(date[2], month, date[0], time[0], time[1], time[2]);
    return date_format;
  }

  getfiveminless(date,reminderThreshold) {
    let milliseconds = Date.parse(date);
    // 1456729209000
    milliseconds = milliseconds - reminderThreshold * 60 * 1000;
    // - 5 minutes
    let finalDate = new Date(milliseconds);
    let time = [finalDate.getHours(), finalDate.getMinutes(), "00"];
    if (time[0] < 10) time[0] = "0" + time[0];
    if (time[1] < 10) time[1] = "0" + time[1];
    time = time.join(":");
    return time;
  }

  getplusfifteenmin(date) {
    let milliseconds = Date.parse(date);
    // 1456729209000
    milliseconds = milliseconds + 70 * 60 * 1000;
    // + 5 minutes
    let finalDate = new Date(milliseconds);
    let time = [finalDate.getHours(), finalDate.getMinutes(), "00"];
    if (time[0] < 10) time[0] = "0" + time[0];
    if (time[1] < 10) time[1] = "0" + time[1];
    time = time.join(":");
    return time;
  }

  getFollowupDate(date, noofdays) {
    let today = new Date(date);
    let priorDate = new Date().setDate(today.getDate() + noofdays);
    let fortnightAway = new Date(priorDate);
    let finalDate = [
      fortnightAway.getDate(),
      fortnightAway.getMonth(),
      fortnightAway.getFullYear(),
    ];
    finalDate[1]++;
    if (finalDate[1] < 10) finalDate[1] = "0" + finalDate[1];
    if (finalDate[0] < 10) finalDate[0] = "0" + finalDate[0];
    finalDate = finalDate.join("-");
    return finalDate;
  }

  getReminderDateTime(type,bookingDate,hours){
    let milliseconds = Date.parse(bookingDate);
    milliseconds = milliseconds - hours * 60 * 60 * 1000;
    let finalDate = new Date(milliseconds);
    let time = [finalDate.getHours(), finalDate.getMinutes(), "00"];
    if (time[0] < 10) time[0] = "0" + time[0];
    if (time[1] < 10) time[1] = "0" + time[1];
    time = time.join(":");
    let date = [finalDate.getDate(), finalDate.getMonth(), finalDate.getFullYear()];
    if (date[0] < 10) date[0] = "0" + date[0];
    if (date[1] < 10) date[1] = "0" + date[1];
    date = date.join("-");
    if(type === 'date')
      return date;
    else
      return time;

  }
  
  

  saveNotication(
    mode,
    content,
    status,
    booking,
    subject,
    notification_id,
    notification_date,
    notification_time,
    ids
  ) {
    return new Promise((resolve, reject) => {
      const notification = new Notification({
        mode: mode,
        content: content,
        status: status,
        booking_id: booking.bookingID,
        user_id: booking.userID,
        user_phone: this.decrypt(booking.phoneNumber),
        user_email: this.decrypt(booking.emailID),
        subject: subject,
        notification_id: notification_id,
        notification_date: notification_date,
        notification_time: notification_time,
        notification_player_ids:ids,
        notification_type : booking.bookingDetails.booking_type ? booking.bookingDetails.booking_type : "",
        notification_category: booking.bookingDetails.booking_status ? "Booking": "",
        notification_bookingtype: booking.bookingDetails.booking_status ? booking.bookingDetails.booking_status : ""
      });

      notification
        .save()
        .then((savedNotification) => {
          console.log('Db Data :'+ savedNotification.status);
          resolve(savedNotification);
        })
        .catch((e) => reject(e));
    });
  }
}

module.exports = MessageScheduleUtility;
