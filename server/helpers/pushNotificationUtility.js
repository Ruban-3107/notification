const SessionReminder = require("../helpers/sessionReminder");
const SessionNoShow = require("../helpers/sessionNoShow");
const SessionRescheduleReminderLimit = require("../helpers/sessionRescheduleRemiderLimit");
const notificationScheduler = require("../scheduler/scheduler");

class PushNotificationUtility{
  constructor(details) {
    this.bookingDetails = details;
    this.bookingID = details.bookingID;
  }

  async pushNotifyUtility(){
    let pushNotification_notify = [
      "session_reminder_pushNotification"
      // "session_no_show_pushNotification",
      // "session_reschedule_limit_reminder_pushNotification"
    ];
    for (let i = 0; i < pushNotification_notify.length; i++) {
      const notification_id = this.bookingID + "_" + pushNotification_notify[i];
      switch (pushNotification_notify[i]) {
        case "session_reminder_pushNotification":
          const reminder = new SessionReminder("pushNotification", this.bookingDetails, notification_id);
          await reminder.saveNotification();
          break;

        // case "session_no_show_pushNotification":
        //   const noShow = new SessionNoShow("pushNotification", this.bookingDetails, notification_id);
        //   await noShow.saveNotification();
        //   break;
        // case "session_reschedule_limit_reminder_pushNotification":
        //   const rescheduleLimit = new SessionRescheduleReminderLimit("pushNotification", this.bookingDetails, notification_id);
        //   await rescheduleLimit.saveNotification();
        //   break;
        default:
          break;
      }
    }
  }
}

module.exports = PushNotificationUtility ;
