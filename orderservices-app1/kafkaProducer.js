const kafka= require('kafka-node')


// Function to start Kafka producer
function startProducer() {
    // Create Kafka client and producer
    const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
    const producer = new kafka.Producer(client);

    // Define the topic to be created
    const topicToCreate = [{ topic: 'orders', partitions: 1, replicationFactor: 1 }];

    // Create topics
    client.createTopics(topicToCreate, (error, result) => {
        if (error) {
            console.error('Error creating Kafka topic:', error);
        } else {
            console.log('Kafka topic "orders" created:', result);
        }
    });
    // Handle producer ready event
    producer.on('ready', () => {
        console.log('Kafka producer is ready.');
    });

    // Handle producer error event
    producer.on('error', (err) => {
        console.error('Error with Kafka producer:', err);
    });
     
   // Function to close the producer and client
   const closeConnections = () => {
    return new Promise((resolve) => {
        producer.close(() => {
            client.close(resolve);
        });
    });
};

// Return producer and closeConnections function
return { producer, closeConnections };
}

module.exports = startProducer;