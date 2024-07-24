const { KafkaClient, Producer, Consumer } = require('kafka-node');

const Inventory = require('./inventoryModel');

const dotenv = require('dotenv');

const express = require('express');

dotenv.config();

const app = express();

app.use(express.json())





// Log the environment variables to ensure they are read correctly
console.log(`Kafka Bootstrap Servers: '${process.env.KAFKA_BOOTSTRAP_SERVERS}'`);
console.log(`Topic: '${process.env.KAFKA_TOPIC}'`);
console.log(`Group ID: '${process.env.KAFKA_GROUP_ID}'`);




// Ensure the Kafka bootstrap servers environment variable is correctly set
if (!process.env.KAFKA_BOOTSTRAP_SERVERS) {
  throw new Error("KAFKA_BOOTSTRAP_SERVERS environment variable is not set.");
}
if (!process.env.KAFKA_TOPIC) {
  throw new Error("KAFKA_TOPIC environment variable is not set.");
}
if (!process.env.KAFKA_GROUP_ID) {
  throw new Error("KAFKA_GROUP_ID environment variable is not set.");
}


// Connection for Kafka producer
const kafkaClient = new KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
const producer = new Producer(kafkaClient);

producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
  checkTopicAndStartConsumer(); // Check the topic and start the consumer
});

producer.on('error', (err) => {
  console.error('Error with Kafka producer:', err);
});



// Function to check if the topic exists
function topicExists(client, topic, callback) {
  client.loadMetadataForTopics([topic], (error, results) => {
    if (error) {
      callback(error);
      return;
    }
    const metadata = results[1];
    if (metadata && metadata.metadata && metadata.metadata[topic]) {
      callback(null, true); // Topic exists
    } else {
      callback(null, false); // Topic does not exist
    }
  });
}



// Function to check the topic and start the consumer
function checkTopicAndStartConsumer() {
  const checkTopicInterval = setInterval(() => {
    topicExists(kafkaClient, process.env.KAFKA_TOPIC, (error, exists) => {
      if (error) {
        console.error('Error checking if topic exists:', error);
        return;
      }
      if (exists) {
        console.log(`Topic "${process.env.KAFKA_TOPIC}" exists. Starting consumer.`);
        clearInterval(checkTopicInterval); // Stop checking
        startConsumer(); // Start the consumer
      } else {
        console.log(`Topic "${process.env.KAFKA_TOPIC}" does not exist. Retrying...`);
      }
    });
  }, 5000); // Retry every 5 seconds
}



// Function to start Kafka consumer
function startConsumer() {
  const Consumerproperty = {
    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS,
    groupId: process.env.KAFKA_GROUP_ID, // Use the environment variable for groupId
    autoCommit: true,
    fromOffset: 'latest'
  };
  const consumer = new Consumer(Consumerproperty, [{ topic: process.env.KAFKA_TOPIC, partition: 0 }], { autoCommit: true });

  consumer.on('message', async (message) => {
    try {
      const order = JSON.parse(message.value);

      // Update inventory based on the received order
      const inventoryItem = await Inventory.findOne({ itemName: order.item });
      if (!inventoryItem) {
        console.log(`Item not found: ${order.item}`);
        return;
      }

      // Assuming the order's quantity is the amount to reduce inventory
      inventoryItem.stock -= order.quantity;
      await inventoryItem.save();

      console.log(`Inventory updated for item: ${order.item}, New stock: ${inventoryItem.stock}`);

      // Send message to Kafka topic indicating inventory reduction
      const inventoryUpdateMessage = {
        item: order.item,
        message: `Inventory reduced for item: ${order.item}, New stock: ${inventoryItem.stock}`
      };
      producer.send([{ topic: process.env.KAFKA_TOPIC, messages: JSON.stringify(inventoryUpdateMessage) }], (err, data) => {
        if (err) {
          console.error('Error sending message to Kafka:', err);
        } else {
          console.log('Inventory update message sent to Kafka:', data);
        }
      });
    } catch (error) {
      console.error('Error processing Kafka message:', error);
    }
  });

  consumer.on('error', (err) => {
    console.error('Error with Kafka consumer:', err);
  });
  app.listen(process.env.PORT, () => {
    console.log(`inventoryService listening on port ${process.env.PORT}`);
  });
}