const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  endpoint: { type: String, required: true }, // The browser URL
  keys: {
    p256dh: String,
    auth: String
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);