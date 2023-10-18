const SessionReminder = require("../helpers/sessionReminder");
const SessionNoShow = require("../helpers/sessionNoShow");
const SessionRescheduleReminderLimit = require("../helpers/sessionRescheduleRemiderLimit");
const notificationScheduler = require("../scheduler/scheduler");

class WhatsappNotificationUtility{
  constructor(details) {
    this.bookingDetails = details;
    this.bookingID = details.bookingID;
  }

  async whatsappUtility(){
    let whatsApp_notify = [
      "session_reminder_whatsApp"
      // "session_no_show_whatsApp",
      // "session_reschedule_limit_reminder_whatsApp"
    ];
    for (let i = 0; i < whatsApp_notify.length; i++) {
      const notification_id = this.bookingID + "_" + whatsApp_notify[i];
      switch (whatsApp_notify[i]) {
        case "session_reminder_whatsApp":
          const reminder = new SessionReminder("whatsApp", this.bookingDetails, notification_id);
          break;
        // case "session_no_show_whatsApp":
        //   const noShow = new SessionNoShow("whatsApp", this.bookingDetails, notification_id);
        //   await noShow.saveNotification();
        //   break;
        // case "session_reschedule_limit_reminder_whatsApp":
        //   const rescheduleLimit = new SessionRescheduleReminderLimit("whatsApp", this.bookingDetails, notification_id);
        //   await rescheduleLimit.saveNotification();
        //   break;
        default:
          break;
      }
    }
  }
}

module.exports = WhatsappNotificationUtility ;
