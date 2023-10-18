const request = require("request");
const crypto = require('crypto');
const AdminConfig = require('../admin/admin.model');
const Notification = require('../notification/notification.model');

class WhatsappController{
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

  async send(template,decryptedPhone,booking,flag){
    const config = await this.fetchConfig();
    const api_Key = await this.decryptPassword(config.api_key);
    let phone = await this.decrypt(decryptedPhone);
    const sendsmsmstatus = await this.sendWhatsapp(template, config, phone, api_Key);
    if(flag){
      const updatemsg = await this.updateNotificationStatus(booking.notification_id,{'status':sendsmsmstatus});
    }else{
      const storemsg = await this.storemsg(sendsmsmstatus,template,booking);
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

  sendWhatsapp(template, config, phone, api_key){
    return new Promise((resolve,reject)=>{
      let messageUrl =
        {
          url: "https://api.gupshup.io/sm/api/v1/msg",
          method: 'POST',
          form: {
            "channel" : "whatsapp",
            "source" : config.source,
            "destination" : "91"+phone,
            "src.name": config.source_name,
            'message' : template
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apikey': api_key,
            'Accept': 'application/json'
          }
        };
      request(messageUrl, function (error, response) {
        if (!error && response.statusCode <= 202) {
          console.log("SUCCESS WHATSAPP MESSAGE SENT : " + JSON.stringify(response.statusCode));
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

  async fetchConfig(){
    return new Promise((resolve, reject) => {
      AdminConfig
        .get("whatsapp")
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

  storemsg(status,template,booking) {
    return new Promise((resolve, reject) => {
      let notification_time = booking.bookingTime.split(' ');
      const notification = new Notification({
        mode: "whatsApp",
        content: template,
        status: status,
        user_id: booking.userID,
        booking_id: booking.bookingID,
        user_phone: booking.phoneNumber,
        user_email: booking.emailID,
        notification_time: notification_time[1]
      });
      notification.save()
        .then((savedNotification) => {
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

module.exports = WhatsappController;
