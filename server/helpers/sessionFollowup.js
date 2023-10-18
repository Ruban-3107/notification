const MessageScheduleUtility = require("./messageScheduleUtility");

class sessionFollowup {
  constructor(type, details, notification_id) {
    this.type = type;
    this.details = details;
    this.bookingDate = details.bookingDate;
    this.notification_id = notification_id;
  }

  async saveNotification() {
    return new Promise(async (resolve, reject) => {
      try {
        let storeNotification = new MessageScheduleUtility(
          this.type,
          this.details,
          this.notification_id
        );
        if (this.type === "email") {
          await storeNotification.scheduleUtility(
            "Booking_followup_email",
            "email"
          );
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = sessionFollowup;
