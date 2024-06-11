
const Order = require('./orderModel');
//const kafka = require('kafka-node');
const axios = require('axios');

// const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
// const producer = new kafka.Producer(client);

// // Ensuring Kafka producer is ready before sending messages
// producer.on('ready', () => {
//   console.log('Kafka Producer is connected and ready.');
// });

// producer.on('error', (err) => {
//   console.error('Error with Kafka producer:', err);
// });

// Function to send message to Kafka
const sendMessageToKafka = (message) => {
  const payloads = [
    { topic: process.env.TOPIC, messages: JSON.stringify(message) }
  ];

  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending message to Kafka:', err);
    } else {
      console.log('Message sent to Kafka:', data);
    }
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { item, quantity } = req.body;

    // Validate request data
    if (!item || !quantity) {
      return res.status(400).send({ message: 'Item and quantity are required.' });
    }

    const inventoryResponse = await axios.get(`http://localhost:8081/check`, { params: { item, quantity } });

    if (inventoryResponse.data.success) {
      const newOrder = new Order({ item, quantity });
      await newOrder.save();
      sendMessageToKafka(newOrder);
      res.status(201).send(newOrder);
    } else {
      res.status(400).send({ message: inventoryResponse.data.message });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send({ message: 'Error creating order.' });
  }
    
};
