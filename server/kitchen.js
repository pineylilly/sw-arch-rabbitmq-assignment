#!/usr/bin/env node

// Get argv from command line
var args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Usage: node kitchen.js <topic_name>");
    process.exit(1);
}
topic = args[0];

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    var exchange = 'orders'
    // var queue = 'order_queue';

    channel.assertExchange(exchange, 'topic', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true,
    }, (err, q) => {
      if (err) {
        throw err;
      }

      channel.bindQueue(q.queue, exchange, topic);

      channel.prefetch(1);
      console.log(" [*] Waiting for messages for topic %s. To exit press CTRL+C", topic);

      channel.consume(q.queue, function(msg) {
        var secs = JSON.parse(msg.content).quantity
        // console.log(msg.content.toString())
        console.log(" [x] Received");
        console.log(JSON.parse(msg.content));

        setTimeout(function() {
        console.log(" [x] Done");
        channel.ack(msg);
        }, secs * 1000);
      }, {
        noAck: false
      });
    });

    // channel.bindQueue(queue, exchange, topic);

    // channel.prefetch(1);
    // console.log(" [*] Waiting for messages for topic %s. To exit press CTRL+C", topic);
    // channel.consume(queue, function(msg) {
    //     var secs = msg.content.toString().split('.').length - 1;
    //     // console.log(msg.content.toString())
    //     console.log(" [x] Received");
    //     console.log(JSON.parse(msg.content));

    //     setTimeout(function() {
    //     console.log(" [x] Done");
    //     channel.ack(msg);
    //     }, secs * 1000);
    // }, {
    // noAck: false
    // });
  });
});  
