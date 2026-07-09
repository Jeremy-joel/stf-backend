const ImpactItem = require('../models/ImpactItem');

const getPublicImpact = async (req, res) => {
  try {
    const items = await ImpactItem.find({ published: true }).sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Could not load impact items.' });
  }
};

const getAllImpact = async (req, res) => {
  try {
    const items = await ImpactItem.find().sort({ order: 1, createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Could not load impact items.' });
  }
};

const createImpactItem = async (req, res) => {
  try {
    const { label, order, published } = req.body;
    if (!label) return res.status(400).json({ message: 'Label is required.' });

    const item = await ImpactItem.create({
      label,
      order: order || 0,
      published: published !== 'false',
      imageUrl: req.file ? req.file.path : undefined
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Could not create impact item.' });
  }
};

const updateImpactItem = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.published !== undefined) updates.published = updates.published !== 'false';
    if (req.file) updates.imageUrl = req.file.path;

    const item = await ImpactItem.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ message: 'Impact item not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Could not update impact item.' });
  }
};

const deleteImpactItem = async (req, res) => {
  try {
    const item = await ImpactItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Impact item not found.' });
    res.json({ message: 'Impact item deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete impact item.' });
  }
};

module.exports = { getPublicImpact, getAllImpact, createImpactItem, updateImpactItem, deleteImpactItem };
