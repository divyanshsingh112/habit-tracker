const Subscription = require('../models/Subscription');
const webpush = require('web-push');
require('dotenv').config();

// Configure the Mailman
webpush.setVapidDetails(
  process.env.MAILTO,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.subscribe = async (req, res) => {
  const { userId, subscription } = req.body;
  try {
    // Save or update the subscription for this user
    await Subscription.findOneAndUpdate(
      { userId },
      { userId, ...subscription },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: 'Subscribed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// This function will be called by the Cron Job
exports.sendReminders = async () => {
  try {
    const allSubs = await Subscription.find();
    
    const notificationPayload = JSON.stringify({
      title: "⚔️ Your Quest Awaits!",
      body: "Don't break your streak! Log your habits for today.",
      icon: "/vite.svg" // Path to your logo
    });

    const promises = allSubs.map(sub => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: sub.keys
      };
      return webpush.sendNotification(pushConfig, notificationPayload)
        .catch(err => {
          if (err.statusCode === 410) {
            // Subscription is gone (user cleared cache), delete it
            return Subscription.deleteOne({ _id: sub._id });
          }
        });
    });

    await Promise.all(promises);
    console.log(`Reminders sent to ${allSubs.length} heroes.`);
  } catch (err) {
    console.error("Error sending reminders:", err);
  }
};