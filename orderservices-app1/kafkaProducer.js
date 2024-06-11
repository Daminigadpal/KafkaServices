const kafka= require('kafka-node')

// Function to start Kafka producer
function startProducer() {
    // Create Kafka client and producer
    const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
    const producer = new kafka.Producer(client);

    // Handle producer ready event
    producer.on('ready', () => {
        console.log('Kafka producer is ready.');
    });

    // Handle producer error event
    producer.on('error', (err) => {
        console.error('Error with Kafka producer:', err);
    });
}
module.exports = startProducer;