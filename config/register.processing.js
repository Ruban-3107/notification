const EmailController = require("../server/email/email.controller");
const OtpSmsController = require("../server/otpSms/otpsms.controller");
const SmsController = require("../server/message/message.controller");
const PushNotificationController = require("../server/one-signal/one-signal.controller");
const WhatsappController = require("../server/whatsApp/whatsApp.controller");
const MapWordsInTempalte = require("../server/helpers/mapWordsInTempalte");
const Template = require("../server/template/template.model");
const getTemplate = require("../server/helpers/get-template")

class RegisterProcessing {
  constructor(message) {
    this.message = message;
  }
  async processmsg() {
    console.log('this is in processmsg of RegisterProcessing');
    let event;
    let template;
    let templateMessage;
    let subject;
    let obj = {
      userName : this.message.userName,
      otp : this.message.otp
    };
    for (let index = 0; index < this.message.pref.length; index++) {
      switch (this.message.pref[index]) {
        case "Email":
          //Call Email class
          console.log("email-------for REGISTER");
          if(this.message.emailID){
            event = this.message.event + "_email";
            const email = new EmailController();
            template = await getTemplate(event,this.message.appId);
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
          }
          break;
          case "OTPSMS":
            //Call SMS class
            console.log("SMS for REGISTER-------");
            const sms = new OtpSmsController();
            event = this.message.event + "_sms";
            template = await getTemplate(event,this.message.appId);
            templateMessage = await MapWordsInTempalte(
                template[0].template,
                obj
            );
            subject = template[0].subject;
            sms.send(
                templateMessage,
                subject,
                this.message.phoneNumber,
                this.message,
                false
            );
            break;
            case "SMS":
              console.log("sms.....>>>>>called")
              //Call SMS class
              console.log("SMS for REGISTER-------");
              const sms = new SmsController();
              event = this.message.event + "_sms";
              template = await getTemplate(event,this.message.appId);
              templateMessage = await MapWordsInTempalte(
                  template[0].template,
                  obj
              );
              subject = template[0].subject;
              sms.send(
                  templateMessage,
                  subject,
                  this.message.phoneNumber,
                  this.message,
                  false
              );
              console.log("sms send>>>>>>>>>>>>......")
              break;
          case "WhatsApp":
            //Call WHATSAPP class
            console.log("Whatsapp-------for REGISTER");
            const whatsApp = new WhatsappController();
            event = this.message.event + "_whatsApp";
            template = await getTemplate(event,this.message.appId);
            templateMessage = await MapWordsInTempalte(
                template[0].template,
                obj
            );
            whatsApp.send(templateMessage, this.message.phoneNumber, this.message, false);
            break;
          case "PushNotifications":
            //Call PUSHNOTIFICATION class
            console.log("PushNotification-------for REGISTER");
            const pushNotify = new PushNotificationController();
            event = this.message.event + "_pushNotification";
            template = await getTemplate(event,this.message.appId);
            templateMessage = await MapWordsInTempalte(
                template[0].template,
                obj
            );
            subject = template[0].subject;
            pushNotify.send(templateMessage, subject, this.message.onesignal, this.message, false);
            break;
          default:
            break;
        }
      }
    }
}

module.exports = RegisterProcessing;
