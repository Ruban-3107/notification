const config = require('../../config/config');
const request = require("request");
const crypto = require('crypto');
const Template = require('../template/template.model');
const AdminConfig = require('../admin/admin.model');
const Notification = require('../notification/notification.model');

class EmailController {
  constructor(props) {
    // super(props);
  }

  /**
   * Send email
   * @property {string} event - type of event
   * @property {string} notification_id - unique id for each notification
   * @property {string} booking_id - id for which notification being triggered
   * @property {string} email - user email
   * @property {string} user_id - user mongo id for reference
   * @returns {response}
   */

  async send(template, subject, decryptedEmail, booking, flag) {
    const config = await this.fetchConfig();
    console.log(decryptedEmail+"Before Decrypted");
    let email = await this.decrypt(decryptedEmail)
    console.log(email+"After Decrypted");
    const sendgrid_api_Key = await this.decryptPassword(config.sendgrid_api_key);
    const sendsmsmstatus = await this.sendEmail(template, config.sendgrid_from, email, sendgrid_api_Key, subject);
    if (flag) {
      const updatemsg = await this.updateNotificationStatus(booking.notification_id, { 'status': sendsmsmstatus });
    } else {
      const storemsg = await this.storemsg(sendsmsmstatus, template, subject, email, booking);
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

  sendEmail(template, from, to, key, subject) {
    return new Promise((resolve, reject) => {
      let options = {
        method: 'POST',
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: {
          'content-type': 'application/json',
          "authorization": "Bearer " + key
        },
        body: {
          personalizations: [{
            to: [{ email: to, name: '' }],
            subject: subject
          }],
          from: { email: from, name: '1To1Help' },
          reply_to: { email: from, name: '1To1Help' },
          content: [{ type: 'text/html', value: template }]
        },
        json: true
      };
      request(options, function (error, response) {
        if (!error && response.statusCode <= 202) {
          console.log("SUCCESS EMAIL SENT : " + JSON.stringify(response.statusCode));
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
    })
  }

  async fetchConfig() {
    return new Promise((resolve, reject) => {
      AdminConfig
        .get("email")
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
      const key = crypto.scryptSync('onetoone', 'salt', 24);
      const iv = Buffer.alloc(16, 0);

      // const cipher = crypto.createCipheriv(algorithm, key, iv);
      // const encrypt = cipher.update('passwordhere', 'utf8', 'hex') + cipher.final('hex');
      // console.log('encrypted', encrypt)

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      const decrypted = decipher.update(password, 'hex', 'utf8') + decipher.final('utf8');
      return decrypted;
    }
    catch (e) {
      return password;
    }
  }

  storemsg(status, template, subject, email, booking) {
    return new Promise((resolve, reject) => {
      const notification = new Notification({
        mode: "email",
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
          return savedNotification;
        })
        .catch(e => reject(e));
    });
  }

  updateNotificationStatus(id, status) {
    return new Promise((resolve, reject) => {
      Notification
        .updateNotification(id, status)
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
module.exports = EmailController;

