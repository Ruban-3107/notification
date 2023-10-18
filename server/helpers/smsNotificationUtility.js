const SessionReminder = require("../helpers/sessionReminder");
const SessionNoShow = require("../helpers/sessionNoShow");
const SessionFollowupEc = require("../helpers/sessionFollowupEc");
const SessionFollowup = require("../helpers/sessionFollowup");
const SessionRescheduleReminderLimit = require("../helpers/sessionRescheduleRemiderLimit");
const notificationScheduler = require("../scheduler/scheduler");

class SmsNotificationUtility{
  constructor(details) {
    this.bookingDetails = details;
    this.bookingID = details.bookingID;
  }

  async smsUtility(){
    let SMS_notify = ["session_reminder_sms"
      // "session_no_show_sms","session_reschedule_limit_reminder_sms"
    ];
    for (var i = 0; i < SMS_notify.length; i++) {
      const notification_id = this.bookingID + "_" + SMS_notify[i];
      //console.log(notification_id+" *******************notification_id*********************");
      switch (SMS_notify[i]) {
        case "session_reminder_sms":
          const reminder = new SessionReminder("sms", this.bookingDetails, notification_id);
          //console.log(reminder+ " &&&&&&&&&&&&&&&&remainder&&&&&&&&&&&&&&");
          await reminder.saveNotification();
          break;
        // case "session_no_show_sms":
        //   const noShow = new SessionNoShow("sms", this.bookingDetails, notification_id);
        //   await noShow.saveNotification();
        //   break;
        // case "session_reschedule_limit_reminder_sms":
        //   const rescheduleLimit = new SessionRescheduleReminderLimit("sms", this.bookingDetails, notification_id);
        //   await rescheduleLimit.saveNotification();
        //   break;
        default:
          break;
      }
    }
  }
}
module.exports = SmsNotificationUtility ;
