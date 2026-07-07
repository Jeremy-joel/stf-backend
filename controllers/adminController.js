const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Donation = require('../models/Donation');
const generateToken = require('../utils/generateToken');

/* ---------------- LOGIN ---------------- */
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    res.json({
      token: generateToken(admin._id),
      username: admin.username
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

/* ---------------- LIST + FILTER DONATIONS ---------------- */
// Supports: /api/admin/donations?status=successful&method=mpesa&from=2026-01-01&to=2026-07-01&search=jane
const getDonations = async (req, res) => {
  try {
    const { status, method, from, to, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (method) query.paymentMethod = method;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (search) {
      query.$or = [
        { donorName: new RegExp(search, 'i') },
        { donorEmail: new RegExp(search, 'i') },
        { donorPhone: new RegExp(search, 'i') }
      ];
    }

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Donation.countDocuments(query);

    res.json({ donations, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not load donations.' });
  }
};

/* ---------------- DASHBOARD STATS ---------------- */
const getStats = async (req, res) => {
  try {
    const totalRaised = await Donation.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const byMethod = await Donation.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Last 6 months, grouped by month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const byMonth = await Donation.aggregate([
      { $match: { status: 'successful', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalRaised: totalRaised[0]?.total || 0,
      totalDonations: totalRaised[0]?.count || 0,
      byMethod,
      byMonth
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load stats.' });
  }
};

/* ---------------- MANUALLY LOG A DONATION (e.g. reported bank transfer) ---------------- */
const addManualDonation = async (req, res) => {
  try {
    const { donorName, donorEmail, donorPhone, amount, paymentMethod, notes } = req.body;

    if (!donorName || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'Name, amount and payment method are required.' });
    }

    const donation = await Donation.create({
      donorName,
      donorEmail,
      donorPhone,
      amount,
      paymentMethod,
      notes,
      status: 'successful',
      loggedByAdmin: true
    });

    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: 'Could not save donation.' });
  }
};

/* ---------------- EDIT / DELETE ---------------- */
const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!donation) return res.status(404).json({ message: 'Donation not found.' });
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: 'Could not update donation.' });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found.' });
    res.json({ message: 'Donation deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete donation.' });
  }
};

/* ---------------- CSV EXPORT (opens directly in Excel) ---------------- */
const exportCSV = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });

    const header = ['Date', 'Donor Name', 'Email', 'Phone', 'Amount (KES)', 'Method', 'Status', 'Reference'];
    const rows = donations.map(d => [
      d.createdAt.toISOString().split('T')[0],
      d.donorName,
      d.donorEmail || '',
      d.donorPhone || '',
      d.amount,
      d.paymentMethod,
      d.status,
      d.txRef || ''
    ]);

    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="donations.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Could not export donations.' });
  }
};

module.exports = {
  loginAdmin,
  getDonations,
  getStats,
  addManualDonation,
  updateDonation,
  deleteDonation,
  exportCSV
};
