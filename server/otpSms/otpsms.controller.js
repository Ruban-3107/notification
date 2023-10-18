// const Message = require('./message.model');
const mongoose = require('mongoose');
const http = require('http');
const request = require("request");
const Config = require('../../config/config');
const crypto = require('crypto');
const Template = require('../template/template.model');
const AdminConfig = require('../admin/admin.model');
const qs = require("querystring");
const Notification = require('../notification/notification.model');

class OtpSmsController{
  constructor(props) {
    // super(props);
  }

  /**
   * Send Sms
   * @property {string} event - type of event
   * @property {string} booking_id - id for which notification being triggered
   * @property {string} phone - user phone
   * @property {string} user_id - user mongo id for reference
   * @returns {response}
   */

  async send(template,subject,decryptedPhone,booking,flag){
    console.log("template",template)
    console.log("subject",subject)
    console.log("phone",decryptedPhone)
    console.log("booking",booking)
    console.log("flag",flag)
    console.log(decryptedPhone+" Before Decrypted");
    let phone = await this.decrypt(decryptedPhone);
    console.log(phone+ " After Decrypted ");
    // const config = await this.fetchConfig();
    // const password = await this.decryptPassword(config.password);
    const sendsmsmstatus = await this.sendSms(template, Config, phone);
    if(flag){
      const updatemsg = await this.updateNotificationStatus(booking.notification_id,{'status':sendsmsmstatus});
    }else{
      const storemsg = await this.storemsg(sendsmsmstatus,template,booking,subject);
    }
  }

  decrypt(data) {
    console.log("decrypt called:")
    try {
      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync('onetoone','salt', 24);
      const iv = Buffer.alloc(16, 0);
      // const cipher = crypto.createCipheriv(algorithm, key, iv);
      // const encrypt = cipher.update('passwordhere', 'utf8', 'hex') + cipher.final('hex');
      // console.log('encrypted', encrypt)
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      console.log("decipher:",decipher)
      const decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
      
      console.log("decrypted:",decrypted)
      return decrypted;
    }
    catch(e) {
      return data;
    }
  }

  sendSms(template, config, phone){
    return new Promise((resolve, reject) => {
      const data = qs.stringify({
        numbers: phone,
        sender:"MYHELP",
        message: template
      });
      const url = "https://api.textlocal.in/send/?apiKey="+Config.otpApiKey+'&'+data;
      // const url = "http://api.mVaayoo.com/mvaayooapi/MessageCompose?user="+config.username+":"+password+"&senderID="+config.sender_id+"&receipientno="+
      //   phone+"&dcs=0&msgtxt="+template+"&state=1&template_id=1407159884872109072";

      console.log('url--->>>>>>>>>>>>>>>>')
      console.log(url)

      request(url, function (error, response) {
        if (!error && response.statusCode <= 202) {
          console.log("SUCCESS SMS SENT: " + JSON.stringify(response.statusCode));
          resolve(true);
        }
        else {
          try {
            console.log("ERROR : " + JSON.stringify(response.body));
          }
          catch (e) {
            console.log(e);
          }
          reject(false);
        }
      });
    });
  }

  async fetchConfig(){
    return new Promise((resolve, reject) => {
      AdminConfig
        .get("message")
        .then((config) => {
          // console.log("config -> config -> config", config)
          if (config) resolve(config[0].config);
          else reject("No config found");
        })
        .catch((e) => reject(e));
    });
  }

  decryptPassword(password) {
    try {
      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync('onetoone','salt', 24);
      const iv = Buffer.alloc(16, 0);

      // const cipher = crypto.createCipheriv(algorithm, key, iv);
      // const encrypt = cipher.update('passwordhere', 'utf8', 'hex') + cipher.final('hex');
      // console.log('encrypted', encrypt)

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      const decrypted = decipher.update(password, 'hex', 'utf8') + decipher.final('utf8');
      return decrypted;
    }
    catch(e) {
      return password;
    }
  }

  decrypt(data) {
    console.log("decrypt called:")
    try {
      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync('onetoone','salt', 24);
      const iv = Buffer.alloc(16, 0);
  
      // const cipher = crypto.createCipheriv(algorithm, key, iv);
      // const encrypt = cipher.update('passwordhere', 'utf8', 'hex') + cipher.final('hex');
      // console.log('encrypted', encrypt)
  
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      console.log("decipher:",decipher)
      const decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
      
      console.log("decrypted:",decrypted)
      return decrypted;
    }
    catch(e) {
      return data;
    }
  }

  storemsg(status,template,booking,subject) {
    return new Promise((resolve, reject) => {
      // let notification_time = booking.bookingTime.split(' ');
      const notification = new Notification({
        mode: "sms",
        content: template,
        status: status,
        user_id: booking.userID,
        subject: subject,
        booking_id: booking.bookingID,
        user_phone: this.encrypt(booking.phoneNumber),
        user_email: this.encrypt(booking.emailID),
        notification_time: booking.notification_time
      });
      notification.save()
        .then((savedNotification) => {
          let decryptedEmail = this.decrypt(savedNotification.user_email);
          savedNotification.user_email = decryptedEmail;
          let decryptedPhone = this.decrypt(savedNotification.user_phone);
          savedNotification.user_phone = decryptedPhone;
          console.log("saved notification---->>>>>>>>>>>>>>>>>>>>")
          console.log(savedNotification)
          return savedNotification;
        })
        .catch(e => reject(e));
    });
  }

  updateNotificationStatus(id,status) {
    return new Promise((resolve, reject) => {
      Notification
        .updateNotification(id,status)
        .then((notification) => {
          console.log("notification -> notification -> notification", notification)
          if (notification) resolve(notification);
          else reject("No notification found");
        })
        .catch((e) => reject(e));
    });
  }

  encrypt(data) {
    try {
      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync('onetoone', 'salt', 24);
      const iv = Buffer.alloc(16, 0);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      const encrypt = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
      console.log("function:encryptphone:", encrypt)
      return encrypt
    } catch (e) {
      return data;
    }
  }
}
module.exports = OtpSmsController;

