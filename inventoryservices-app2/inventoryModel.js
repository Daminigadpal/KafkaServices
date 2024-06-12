const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


//connection foe mongoDb
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

//define Scheme &model
const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    unique: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  }
});

const Inventory = mongoose.model('Inventory', inventorySchema);






module.exports = Inventory;
