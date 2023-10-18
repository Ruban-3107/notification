const EmailController = require("../server/email/email.controller");
const SmsController = require("../server/message/message.controller");
const OtpSmsController = require("../server/otpSms/otpsms.controller");
const PushNotificationController = require("../server/one-signal/one-signal.controller");
const WhatsappController = require("../server/whatsApp/whatsApp.controller");
const MapWordsInTempalte = require("../server/helpers/mapWordsInTempalte");
const CancelNotificationUtility = require("../server/helpers/cancelNotification");
const EmailNotificationUtility = require("../server/helpers/emailNotificationUtility");
const SmsNotificationUtility = require("../server/helpers/smsNotificationUtility");
const WhatsappNotificationUtility = require("../server/helpers/whatsappNotificationUtility");
const PushNotificationUtility = require("../server/helpers/pushNotificationUtility");
const Template = require("../server/template/template.model");
const getTemplate = require("../server/helpers/get-template");
const e = require("express");

class MessageProcessing {
  constructor(message) {
    this.message = message;
  }

  async processmsg() {
    if (this.message.class === "CLASSA") {
      let event;
      let template;
      let templateMessage;
      let subject;
      let obj = {
        userName: this.message.userName,
        bookingDate: this.message.bookingDate,
        booking_type: this.message.booking_type,
        bookingTime: this.message.booking_startTime
      };
      for (let index = 0; index < this.message.pref.length; index++) {
        switch (this.message.pref[index]) {
          case "Email":
            //Call Email class
            console.log("email-------", this.message.event + "_email");
            event = this.message.event + "_email";
            const email = new EmailController();
            template = await getTemplate(event, this.message.appId);
            templateMessage = await MapWordsInTempalte(
              template[0].template,
              obj
            );
            subject = template[0].subject;
            email.send(
              templateMessage,
              subject,
              this.message.emailID,
              this.message,
              false
            );
            await this.scheduleJobs(
              "Email",
              this.message
            );
            break;
          case "SMS":
            //Call SMS class
            console.log("SMS-------", this.message.event + "_sms");
            event = this.message.event + "_sms";
            const sms = new SmsController();
            template = await getTemplate(event, this.message.appId);
            //console.log(template + " ******************template for sms confirm*****************");
            templateMessage = await MapWordsInTempalte(
              template[0].template,
              obj
            );
            // console.log(templateMessage +" ++++++++++++++++++++++templateMessage+++++++++++++++++");
            subject = template[0].subject;
            // console.log(subject +" ++++++++++++++++++++++subject+++++++++++++++++");
            sms.send(
              templateMessage,
              subject,
              this.message.phoneNumber,
              this.message,
              false
            );
            await this.scheduleJobs(
              "SMS",
              this.message,
            );
            break;
          case "WhatsApp":
            //Call WHATSAPP class
            console.log("Whatsapp-------", this.message.event + "_whatsApp");
            const whatsApp = new WhatsappController();
            event = this.message.event + "_whatsApp";
            template = await getTemplate(event, this.message.appId);
            templateMessage = await MapWordsInTempalte(
              template[0].template,
              obj
            );
            whatsApp.send(templateMessage, this.message.phoneNumber, this.message, false);
            await this.scheduleJobs(
              "Whatsapp",
              this.message
            );
            break;
          case "PushNotifications":
            //Call PUSHNOTIFICATION class
            console.log("PushNotification-------", this.message.event + "_pushNotification");
            const pushNotify = new PushNotificationController();
            event = this.message.event + "_pushNotification";
            template = await getTemplate(event, this.message.appId);
            templateMessage = await MapWordsInTempalte(
              template[0].template,
              obj
            );
            subject = template[0].subject;
            pushNotify.send(templateMessage, subject, this.message.onesignal, this.message, false);
            await this.scheduleJobs(
              "PushNotification",
              this.message
            );
            break;
          default:
            break;
        }
      }
    }
  }

  async scheduleJobs(type, details) {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.message.event === "Cancel") {
          const cancelNotify = new CancelNotificationUtility(details.bookingID);
          await cancelNotify.cancel();

        } else if (this.message.event === "New_concern" || this.message.event === "Booked" || this.message.event === 'Reschedule') {
          if (details.rescheduled_Id) {
            const cancelNotify = new CancelNotificationUtility(details.rescheduled_Id);
            await cancelNotify.cancel();
          }
          if (type === "Email") {
            const emailNotificationUtility = new EmailNotificationUtility(details);
            await emailNotificationUtility.emailUtility();

          } else if (type === "SMS") {
            const smsNotificationUtility = new SmsNotificationUtility(details);
            //console.log(smsNotificationUtility+" #########################smsNotificationUtility#######################");
            await smsNotificationUtility.smsUtility();

          } else if (type === "Whatsapp") {
            const whatsappNotificationUtility = new WhatsappNotificationUtility(details);
            await whatsappNotificationUtility.whatsappUtility();

          } else if (type === "PushNotification") {
            const pushNotificationUtility = new PushNotificationUtility(details);
            await pushNotificationUtility.pushNotifyUtility();

          }
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = MessageProcessing;
