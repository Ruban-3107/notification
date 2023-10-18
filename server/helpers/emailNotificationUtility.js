const SessionReminder = require("../helpers/sessionReminder");
const SessionNoShow = require("../helpers/sessionNoShow");
const SessionFollowupEc = require("../helpers/sessionFollowupEc");
const SessionFollowup = require("../helpers/sessionFollowup");
const SessionRescheduleReminderLimit = require("../helpers/sessionRescheduleRemiderLimit");
const notificationScheduler = require("../scheduler/scheduler");

class EmailNotificationUtility{
  constructor(details) {
    this.bookingDetails = details;
    this.bookingID = details.bookingID;
  }

  async emailUtility(){
    let emailNotify = [
      "session_reminder_email"
      // "session_no_show_email",
      // "session_reschedule_limit_reminder_email",
      // "followup_Ec_email",
      // "followup_email",
    ];

    for (let i = 0; i < emailNotify.length; i++) {
      const notification_id = this.bookingID + "_" + emailNotify[i];

      switch (emailNotify[i]) {
        case "session_reminder_email":
          const reminder = new SessionReminder("email", this.bookingDetails, notification_id);
          await reminder.saveNotification();
          break;

        // case "session_no_show_email":
        //   const noShow = new SessionNoShow("email", this.bookingDetails, notification_id);
        //   await noShow.saveNotification();
        //   break;

        // case "session_reschedule_limit_reminder_email":
        //   const rescheduleLimit = new SessionRescheduleReminderLimit("email", this.bookingDetails, notification_id);
        //   await rescheduleLimit.saveNotification();
        //   break;

        // case "followup_Ec_email":
        //   const followupEc = new SessionFollowupEc("email", this.bookingDetails, notification_id);
        //   await followupEc.saveNotification();
        //   break;

        // case "followup_email":
        //   const followup = new SessionFollowup("email", this.bookingDetails, notification_id);
        //   await followup.saveNotification();
        //   break;

        default:
          break;
      }
    }
  }

}

module.exports = EmailNotificationUtility ;
