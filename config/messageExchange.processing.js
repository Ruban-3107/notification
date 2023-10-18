const MessageProcessing = require('./message.proceessing');
const RegisterProcessing = require('./register.processing');
const ExploreProcessing = require('./strapi.processing');

class MessageExchangeProcessing {
  constructor(message) {
    this.message = JSON.parse(message);
    this.exchange = this.message.messageExchange;
  }
  async processmsg() {
    console.log('this is in processmsg');
    if(this.exchange === 'Register'){
      console.log('this is in Register');
      const message = new RegisterProcessing(this.message);
      message.processmsg();
    }else if(this.exchange === 'Booking'){
      const message = new MessageProcessing(this.message);
      message.processmsg();
    }else if(this.exchange === 'Explore'){
      const message = new ExploreProcessing(this.message);
      message.processmsg();
    }
  }
}

module.exports = MessageExchangeProcessing;
