const Program = require('../models/Program');

// PUBLIC - only shows published programs, for the live website
const getPublicPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ published: true }).sort({ order: 1, createdAt: 1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: 'Could not load programs.' });
  }
};

// ADMIN - shows everything, published or not
const getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ order: 1, createdAt: 1 });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: 'Could not load programs.' });
  }
};

const createProgram = async (req, res) => {
  try {
    const { title, description, order, published } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const program = await Program.create({
      title,
      description,
      order: order || 0,
      published: published !== 'false',
      imageUrl: req.file ? req.file.path : undefined
    });

    res.status(201).json(program);
  } catch (err) {
    res.status(500).json({ message: 'Could not create program.' });
  }
};

const updateProgram = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.published !== undefined) updates.published = updates.published !== 'false';
    if (req.file) updates.imageUrl = req.file.path;

    const program = await Program.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!program) return res.status(404).json({ message: 'Program not found.' });
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: 'Could not update program.' });
  }
};

const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found.' });
    res.json({ message: 'Program deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete program.' });
  }
};

module.exports = { getPublicPrograms, getAllPrograms, createProgram, updateProgram, deleteProgram };
