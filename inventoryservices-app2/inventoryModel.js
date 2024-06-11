const mongoose = require('mongoose');

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
