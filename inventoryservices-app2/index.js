const { KafkaClient, Producer, Consumer } = require('kafka-node');
const Inventory = require('./inventoryModel');
const dotenv = require('dotenv');

dotenv.config();

// Log the environment variables to ensure they are read correctly
console.log(`Kafka Bootstrap Servers: '${process.env.KAFKA_BOOTSTRAP_SERVERS}'`);
console.log(`Topic: '${process.env.TOPIC}'`);

// Ensure the Kafka bootstrap servers environment variable is correctly set
if (!process.env.KAFKA_BOOTSTRAP_SERVERS) {
  throw new Error("KAFKA_BOOTSTRAP_SERVERS environment variable is not set.");
}

// Connection for Kafka producer
const kafkaClient = new KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
const producer = new Producer(kafkaClient);

producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (err) => {
  console.error('Error with Kafka producer:', err);
});

// Connection for Kafka consumer
const consumer = new Consumer(kafkaClient, [{ topic: process.env.TOPIC, partition: 0 }], { autoCommit: true });

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
    producer.send([{ topic: process.env.TOPIC, messages: JSON.stringify(inventoryUpdateMessage) }], (err, data) => {
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
