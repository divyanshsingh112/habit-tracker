const MonthData = require('../models/MonthData');

exports.getAllData = async (req, res) => {
  try {
    const { userId } = req.params;
    const allData = await MonthData.find({ userId });
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMonth = async (req, res) => {
  try {
    const { userId, year, month } = req.params;
    const { habits } = req.body;
    await MonthData.findOneAndUpdate(
      { userId, year, month },
      { habits },
      { upsert: true, new: true }
    );
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteYear = async (req, res) => {
  try {
    const { userId, year } = req.params;
    const result = await MonthData.deleteMany({ userId, year });
    res.json({ message: 'Year deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};