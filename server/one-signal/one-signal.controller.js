const Template = require('../template/template.model');
const AdminConfig = require('../admin/admin.model');
const request = require("request");
const crypto = require('crypto');
const Notification = require('../notification/notification.model');

/**
 * Send one-signal
 * @property {string} req.body.message
 * @property {number} req.body.appid
 * @returns {response}
 */

class PushNotificationController {
  constructor(props) {
    // super(props);
  }

  /**
   * Send Onesignal
   * @property {string} event - type of event
   * @property {string} booking_id - id for which notification being triggered
   * @property {string} user_id - user mongo id for reference
   * @property {string} name - name of the user
   * @property {string} bookingDetails - booking details for refrence
   * @property {string} subject - header of the notification
   * @returns {response}
   */

  async send(template, subject, onesignal, booking, flag) {
    let ids = [];
    if (flag) {
      ids = onesignal;
    } else {
      for (var i = 0; i < onesignal.length; i++) {
        ids.push(onesignal[i].player_id);
      }
    }
    const config = await this.fetchConfig();
    const authorisation = await this.decryptPassword(config.onesignal_authorisation);
    // const authorisation = onesignal[0].authKey;
    const sendsmsmstatus = await this.sendOnesignal(template, ids, authorisation, subject);
    if (flag) {
      const updatemsg = await this.updateNotificationStatus(booking.notification_id, { 'status': sendsmsmstatus });
    } else {
      const storemsg = await this.storemsg(sendsmsmstatus, template, subject, ids, booking);
    }
  }

  sendOnesignal(template, player_ids, authorisation, heading) {
    return new Promise((resolve, reject) => {
      let url_api = 'https://onesignal.com/api/v1/notifications';
      let one_signal_header;
      const contents = template;
      let secret_key = "Basic " + authorisation
      console.log(secret_key)
      //One signal header
      one_signal_header =
      {
        url: url_api,
        method: 'POST',
        body: {
          app_id: "fcded74a-a5f0-465a-af23-0053d4d23ec3",
          contents: { en: contents },
          tags: [],
          include_player_ids: player_ids,
          headings: { en: heading },
          // android_group: groupKey,
          // android_group_message: groupMessage,
          // data:id
        },
        json: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": secret_key
        }
      };//End of one signal header.
      request(one_signal_header, function (error, response) {
        if (!error && response.statusCode == 200) {
          console.log("SUCCESS PUSHNOTIFICATION: " + JSON.stringify(response.body));
          resolve(true);
        }
        else {
          try {
            console.log("ERROR PUSHNOTIFICATION: " + JSON.stringify(response.body.errors));
          }
          catch (e) {
            console.log(e + "PUSHNOTIFICATION catch block Error");
          }
          reject(false);
        }
      });
    })
  }

  async fetchConfig() {
    return new Promise((resolve, reject) => {
      AdminConfig
        .get("onesignal")
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

  storemsg(status, template, subject, ids, message) {
    console.log("message notification is: -=->>", message);
    return new Promise((resolve, reject) => {
      const notification = new Notification({
        mode: "pushNotification",
        content: template,
        status: status,
        user_id: message.userID,
        subject: subject,
        booking_id: message.bookingID,
        user_phone: this.encrypt(message.phoneNumber),
        user_email: this.encrypt(message.emailID),
        notification_time: message.notification_time,
        notification_player_ids: ids,
        notification_type: message.notification_type, //booking type
        notification_category: message.notification_category,
        notification_bookingtype: message.notification_bookingtype,
        notification_date: message.notification_date,
        articleId: message.articleId
      });
      notification.save()
        .then((savedNotification) => {
          let decryptedEmail = this.decrypt(savedNotification.user_email);
          savedNotification.user_email = decryptedEmail;
          let decryptedPhone = this.decrypt(savedNotification.user_phone);
          savedNotification.user_phone = decryptedPhone;
          console.log('saved notification PUSHNOTIFICATION', savedNotification);
          return savedNotification;
        })
        .catch(e => reject(e));
    });
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

  updateNotificationStatus(id, status) {
    return new Promise((resolve, reject) => {
      Notification
        .updateNotification(id, status)
        .then((notification) => {
          console.log(" PUSHNOTIFICATION notification -> notification -> notification ", notification)
          if (notification) resolve(notification);
          else reject("No notification found for PUSHNOTIFICATION");
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
module.exports = PushNotificationController;


