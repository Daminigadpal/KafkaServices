const mongoose = require('mongoose');

const dotenv = require('dotenv');
const startProducer= require('./kafkaProducer')
dotenv.config();

//define mongoose Scheme & model
const orderSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1 // Assuming quantity must be at least 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);





// Database connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'ordersDatabase' })
  .then(() => {
    console.log('Connected to MongoDB');
    // Start Kafka producer after MongoDB connection is established
    startProducer();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });









module.exports = Order;
