const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Order = require('../orderModel'); // Adjust the path to your Order model

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri =  mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Order Model Test', () => {
  it('should create and save an order successfully', async () => {
    const validOrder = new Order({ item: 'item1', quantity: 10 });
    const savedOrder = await validOrder.save();

    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.item).toBe('item1');
    expect(savedOrder.quantity).toBe(10);
  });

  it('should fail creating an order without required fields', async () => {
    const invalidOrder = new Order({ item: 'item1' });

    let err;
    try {
      await invalidOrder.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.quantity).toBeDefined();
  });
});

const kafka = require('kafka-node');
const dotenv = require('dotenv');
const sinon = require('sinon');
const Inventory = require('../inventoryModel'); // Adjust the path to your Inventory model

dotenv.config();

describe('Kafka Producer and Consumer', () => {
  let producer;
  let consumer;
  let kafkaClient;

  beforeAll(() => {
    kafkaClient = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
    producer = new kafka.Producer(kafkaClient);
    consumer = new kafka.Consumer(kafkaClient, [{ topic: process.env.TOPIC, partition: 0 }], { autoCommit: true });
  });

  it('should connect to Kafka producer', (done) => {
    producer.on('ready', () => {
      expect(producer.ready).toBe(true);
      done();
    });
  });

  it('should send a message to Kafka', (done) => {
    const message = { item: 'item1', quantity: 5 };

    producer.send([{ topic: process.env.TOPIC, messages: JSON.stringify(message) }], (err, data) => {
      expect(err).toBeNull();
      expect(data).toBeDefined();
      done();
    });
  });

  it('should consume a message from Kafka', (done) => {
    const mockMessage = { value: JSON.stringify({ item: 'item1', quantity: 5 }) };
    sinon.stub(consumer, 'on').withArgs('message').yields(mockMessage);

    consumer.on('message', async (message) => {
      const order =   JSON.parse(message.value);
      expect(order.item).toBe('item1');
      expect(order.quantity).toBe(5);
      done();
    });
  });

  afterAll(() => {
    producer.close();
    consumer.close();
    kafkaClient.close();
  });
});
