// const MessageScheduleUtility = require("./messageScheduleUtility");
// const Scheduler = require("../scheduler/scheduler");

// class sessionNoShow {
//   constructor(type, details, notification_id) {
//     this.type = type;
//     this.details = details;
//     this.bookingDate = details.bookingDate;
//     this.notification_id = notification_id;
//   }

//   async saveNotification() {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let todaysDate = new Date();
//         let storeNotification = new MessageScheduleUtility(
//           this.type,
//           this.details,
//           this.notification_id
//         );

//         if (this.type === "email") {
//           storeNotification = await storeNotification.scheduleUtility(
//             "Booking_no_show_email",
//             "email"
//           );
//           if (this.bookingDate === this.bookingDateFormat(todaysDate)) {
//             const schedule = new Scheduler();
//             await schedule.scheduleEachBooking(storeNotification);
//           }
//         } else if (this.type === "sms") {
//           storeNotification = await storeNotification.scheduleUtility(
//             "Booking_no_show_sms",
//             "sms"
//           );
//           if (this.bookingDate === this.bookingDateFormat(todaysDate)) {
//             const schedule = new Scheduler();
//             await schedule.scheduleEachBooking(storeNotification);
//           }
//         } else if (this.type === "pushNotification") {
//           storeNotification = await storeNotification.scheduleUtility(
//             "Booking_no_show_pushNotification",
//             "pushNotification"
//           );
//           if (this.bookingDate === this.bookingDateFormat(todaysDate)) {
//             const schedule = new Scheduler();
//             await schedule.scheduleEachBooking(storeNotification);
//           }
//         } else if (this.type === "whatsApp") {
//           storeNotification = await storeNotification.scheduleUtility(
//             "Booking_no_show_whatsApp",
//             "whatsApp"
//           );
//           if (this.bookingDate === this.bookingDateFormat(todaysDate)) {
//             const schedule = new Scheduler();
//             await schedule.scheduleEachBooking(storeNotification);
//           }
//         }
//         resolve();
//       } catch (error) {
//         reject(error);
//       }
//     });
//   }
//   bookingDateFormat(date) {
//     let finalDate;
//     let day = date.getDate();
//     if(day < 10){
//       day = "0"+day;
//     }
//     let month = date.getMonth()+1;
//     if(month < 10){
//       month = "0"+month;
//     }
//     let year = date.getFullYear();
//     return finalDate = day+'-'+month+'-'+year;
//   }
// }
// module.exports = sessionNoShow;
