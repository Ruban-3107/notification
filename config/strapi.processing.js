const PushNotificationController = require("../server/one-signal/one-signal.controller");
const MapWordsInTempalte = require("../server/helpers/mapWordsInTempalte");
const Template = require("../server/template/template.model");
const User = require('../server/user/user.model');
const Onesignal = require('../server/oneSignal/oneSignal.model');
const getTemplate = require("../server/helpers/get-template");

class ExploreProcessing {
  constructor(message) {
    this.message = message;
  }
  async processmsg() {
    const appId = this.message.appId ;
    const users = await User.getUsers(appId);
    if(users && users.length){
      for(let i = 0; i< users.length;i++){
        this.message.userID = users[i]._id;
        let ids = await Onesignal.getOneSiganlDetails(users[i].account_id);
        if(ids && ids.length){
          let playerIds = [];
          for (let k = 0 ; k < ids.length ; k++){
            playerIds.push(ids[k])
          }
          if(playerIds.length){
            await this.sendNotification(playerIds)
          }
        }
      }
    }
  }

  async sendNotification(playerIds){
    let event;
    let template;
    let templateMessage;
    let subject;
    let obj = {
      tags : this.message.tags
    };
    const pushNotify = new PushNotificationController();
    event = this.message.event + "_pushNotification";
    template = await getTemplate(event,this.message.appId);
    templateMessage = await MapWordsInTempalte(
      template[0].template,
      obj
    );
    subject = template[0].subject;
    pushNotify.send(templateMessage,subject,playerIds,this.message,false);
  }
}

module.exports = ExploreProcessing;
