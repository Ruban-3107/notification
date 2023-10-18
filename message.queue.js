const amqp = require("amqplib");
let channel;
let connection;
const msgExchange = "Notification";
const MessageExchangeProcessing = require('./config/messageExchange.processing');
const Scheduler = require('./server/scheduler/scheduler');
const config = require('./config/config');

class MessageQueue {
  constructor() {
    console.log("<<<<<<<<<<<-------------MsgExchange---------------->>>>>>>>>>>>>>")
  }

  connect() {
    amqp
      .connect(
        config.message_queue
      )
      .then(function (conn) {
        process.once("SIGINT", function () {
          conn.close();
        });
        return conn.createChannel().then(function (ch) {
          let ok = ch.assertExchange(msgExchange, "fanout", { durable: false });
          ok = ok.then(function () {
            return ch.assertQueue("", { exclusive: false });
          });
          ok = ok.then(function (qok) {
            return ch.bindQueue(qok.queue, msgExchange, "queue_name").then(function () {
              return qok.queue;
            });
          });
          ok = ok.then(function (queue) {
            return ch.consume(queue, logMessage, { noAck: true });
          });
          return ok.then(function () {
            const test = new Scheduler();
            test.scheduleJobForBooking();
            test.dailyScheduler();
            test.getScheduledJobs();

            console.log(" [*] Waiting for logs. To exit press CTRL+C");
          });

          async function logMessage(msg) {
            if(msg.content){
              console.log(" [x] '%s'", msg.content.toString());
              const message = new MessageExchangeProcessing(msg.content.toString());
              await message.processmsg();
            }
            else
                console.log("Message received with no content");

          }
        });
      })
      .catch(console.warn);
  }
}

module.exports = MessageQueue;
