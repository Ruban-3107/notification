const MessageScheduleUtility = require("./messageScheduleUtility");
const Scheduler = require("../scheduler/scheduler");

class SessionRescheduleReminderLimit {
  constructor(type, details, notification_id) {
    this.type = type;
    this.details = details;
    this.bookingDate = details.bookingDate;
    this.notification_id = notification_id;
    this.time = details.bookingTime;
  }

  async saveNotification() {
    return new Promise( async (resolve, reject) => {
      try {
        let storeNotification = new MessageScheduleUtility(
          this.type,
          this.details,
          this.notification_id
        );
        const schedule = new Scheduler();
        if (this.type === "email") {
          await storeNotification.scheduleUtility(
            "Booking_reschedule_limit_reminder_email",
            "email"
          );
        } else if (this.type === "sms") {
          await storeNotification.scheduleUtility(
            "Booking_reschedule_limit_reminder_sms",
            "sms"
          );
        } else if (this.type === "pushNotification") {
          await storeNotification.scheduleUtility(
            "Booking_reschedule_limit_reminder_pushNotification",
            "pushNotification"
          );
        } else if (this.type === "whatsApp") {
          await storeNotification.scheduleUtility(
            "Booking_reschedule_limit_reminder_whatsApp",
            "whatsApp"
          );
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  bookingDateFormat(date) {
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

module.exports = SessionRescheduleReminderLimit;
