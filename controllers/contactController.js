const ContactMessage = require('../models/ContactMessage');

// PUBLIC - the website's contact form calls this to store a copy in the database
// (in addition to opening the visitor's email app, which still happens on the frontend)
const submitMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ message: 'Name and message are required.' });
    }

    const saved = await ContactMessage.create({ name, email, phone, subject, message });
    res.status(201).json({ message: 'Message received.', id: saved._id });
  } catch (err) {
    res.status(500).json({ message: 'Could not save message.' });
  }
};

// ADMIN
const getMessages = async (req, res) => {
  try {
    const { read, page = 1, limit = 20 } = req.query;
    const query = {};
    if (read === 'true') query.read = true;
    if (read === 'false') query.read = false;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ContactMessage.countDocuments(query);
    const unreadCount = await ContactMessage.countDocuments({ read: false });

    res.json({ messages, total, unreadCount, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Could not load messages.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Could not update message.' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete message.' });
  }
};

module.exports = { submitMessage, getMessages, markAsRead, deleteMessage };
