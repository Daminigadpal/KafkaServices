const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Inventory = require('../models/inventoryModel'); // Adjust the path to your Inventory model

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Inventory Model Test', () => {
  it('should create and save an inventory item successfully', async () => {
    const validInventory = new Inventory({ itemName: 'item1', stock: 100 });
    const savedInventory = await validInventory.save();

    expect(savedInventory._id).toBeDefined();
    expect(savedInventory.itemName).toBe('item1');
    expect(savedInventory.stock).toBe(100);
  });

  it('should update inventory stock successfully', async () => {
    const inventoryItem = new Inventory({ itemName: 'item1', stock: 100 });
    await inventoryItem.save();

    inventoryItem.stock -= 10;
    const updatedInventory = await inventoryItem.save();

    expect(updatedInventory.stock).toBe(90);
  });
});

const kafka = require('kafka-node');
const dotenv = require('dotenv');
const sinon = require('sinon');

dotenv.config();

describe('Kafka Consumer Inventory Handling', () => {
  let producer;
  let consumer;
  let kafkaClient;

  beforeAll(() => {
    kafkaClient = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
    producer = new kafka.Producer(kafkaClient);
    consumer = new kafka.Consumer(kafkaClient, [{ topic: process.env.TOPIC, partition: 0 }], { autoCommit: true });
  });

  it('should update inventory based on Kafka message', async (done) => {
    const inventoryItem = new Inventory({ itemName: 'item1', stock: 100 });
    await inventoryItem.save();

    const mockMessage = { value: JSON.stringify({ item: 'item1', quantity: 5 }) };
    sinon.stub(consumer, 'on').withArgs('message').yields(mockMessage);

    consumer.on('message', async (message) => {
      const order = JSON.parse(message.value);
      const inventory = await Inventory.findOne({ itemName: order.item });
      expect(inventory).not.toBeNull();
      inventory.stock -= order.quantity;
      const updatedInventory = await inventory.save();
      expect(updatedInventory.stock).toBe(95);
      done();
    });
  });

  afterAll(() => {
    producer.close();
    consumer.close();
    kafkaClient.close();
  });
});
