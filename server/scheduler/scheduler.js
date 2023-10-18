const Notification = require("../notification/notification.model");
const scheduler = require('node-schedule');
const schedule = require('node-schedule');
const EmailController = require("../email/email.controller");
const SmsController = require("../message/message.controller");
const WhatsappController = require("../whatsApp/whatsApp.controller");
const PushNotificationController = require("../one-signal/one-signal.controller");

class notificationScheduler{
  constructor() {
  }

  dailyScheduler() {
    const rule = new schedule.RecurrenceRule();
    rule.hour = 7;
    rule.minute = 30;
    // rule.second = 00;
    rule.tz = 'Asia/Kolkata';
    rule.dayOfWeek = new schedule.Range(0,6);
    let j = schedule.scheduleJob(rule, function(){
      schedule.cancelJob();
      console.log("this will run everyday at 7:30 AM-->>>>>>>>>>>",new Date());
      const temp= new notificationScheduler();
      temp.scheduleJobForBooking();
      const jobs = schedule.scheduledJobs ;
      
    }); 
  }

  async scheduleJobForBooking(){
    let todayDate = new Date();
    let dateFormat = this.bookingDateFormat(todayDate);
    console.log(dateFormat)
    let bookings = await this.getTodayBooking(dateFormat);
    if(bookings.length){
      for(let i = 0;i < bookings.length; i++){
        let temp = await this.scheduleEachBooking(bookings[i]);
      }
    }
  }

  getTodayBooking(date){
     return new Promise((resolve, reject) => {
       Notification
         .getPendingNotification(date)
         .then((bookingResponse) => {
           console.log("bookingResponse -> bookingResponse -> booking", bookingResponse)
           if (bookingResponse) resolve(bookingResponse);
           else reject("No booking found");
         })
         .catch((e) => reject(e));
     });
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

  scheduleEachBooking(booking){
    let notification_id = booking.notification_id;
    let time = booking.notification_time.split(':');
    let hour = time[0];
    let min = time[1];
    let sec = time[2];
    let decryptedEmail = this.decrypt(booking.user_email);
    booking.user_email = decryptedEmail;
    let decryptedPhone = this.decrypt(booking.user_phone);
    booking.user_phone = decryptedPhone;
    const rule = new schedule.RecurrenceRule();
    rule.hour = hour;
    rule.minute = min;
    rule.second = sec;
    rule.tz = 'Asia/Kolkata';
    let k = schedule.scheduleJob(notification_id,rule,async function(){
      console.log("This will execute on the booking date and time");
      if(booking.mode === 'email'){
        const email = new EmailController();
        await email.send(booking.content,booking.subject,booking.user_email,booking,true)
      }else if(booking.mode === 'sms'){
        const sms = new SmsController;
        await sms.send(booking.content,booking.subject,booking.user_phone,booking,true)
      }else if(booking.mode === 'whatsApp'){
        const whatsApp = new WhatsappController();
        await whatsApp.send(booking.content,booking.user_phone,booking,true)

      }else if(booking.mode === 'pushNotification'){
        const pushNotify = new PushNotificationController();
        await pushNotify.send(booking.content,booking.subject,booking.notification_player_ids,booking,true)
      }
      k.cancel();
      const jobs = schedule.scheduledJobs;
      console.log(jobs+" const jobs 2");
      jobs.forEach(job => {
        console.log(job+" <<<<<<<jobs>>>>>>");     
      });
    });
  }

  cancelScheduleJob(id){
    const my_job = schedule.scheduledJobs[id];
    if(my_job){
      my_job.cancel();
    }
  }

  getScheduledJobs(){
    const jobs = schedule.scheduledJobs;
  }

  bookingDateFormat(date){
    let finalDate;
    let day = date.getDate();
    if(day < 10){
      day = "0"+day;
    }
    let month = date.getMonth()+1;
    if(month < 10){
      month = "0"+month;
    }
    let year = date.getFullYear();
    return finalDate = day+'-'+month+'-'+year;
  }
}
module.exports = notificationScheduler;

