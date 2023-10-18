const Notification = require("../notification/notification.model");
const Scheduler = require("../scheduler/scheduler");

class CancelNotification{
  constructor(bookingId) {
    this.bookingId = bookingId;
  }

  async cancel(){
    let cancelNotify = [
      "session_reminder_email",
      // "session_no_show_email",
      // "session_reschedule_limit_reminder_email",
      // "followup_Ec_email",
      // "followup_email",
      "session_reminder_sms",
      // "session_no_show_sms",
      // "session_reschedule_limit_reminder_sms",
      "session_reminder_whatsApp",
      // "session_no_show_whatsApp",
      // "session_reschedule_limit_reminder_whatsApp",
      "session_reminder_pushNotification"
      // "session_no_show_pushNotification",
      // "session_reschedule_limit_reminder_pushNotification"
    ];
    for (let i = 0; i < cancelNotify.length; i++) {
      let id = this.bookingId+'_'+ cancelNotify[i];
      await this.cancelScheduledNotification(id);
      const cancelNotifyScheduler = new Scheduler();
      await cancelNotifyScheduler.cancelScheduleJob(id)
    }
  }

  cancelScheduledNotification(id) {
    return new Promise((resolve, reject) => {
      Notification.cancelNotification(id)
        .then((notification) => {
          if (notification)
            resolve(notification);
          else reject("No Notification found");
        })
        .catch((e) => reject(e));
    });
  }

}

module.exports = CancelNotification;
