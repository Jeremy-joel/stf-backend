const TeamMember = require('../models/TeamMember');

const getPublicTeam = async (req, res) => {
  try {
    const team = await TeamMember.find({ published: true }).sort({ order: 1, createdAt: 1 });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Could not load team.' });
  }
};

const getAllTeam = async (req, res) => {
  try {
    const team = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Could not load team.' });
  }
};

const createTeamMember = async (req, res) => {
  try {
    const { name, position, bio, email, phone, order, published } = req.body;
    if (!name || !position) {
      return res.status(400).json({ message: 'Name and position are required.' });
    }

    const member = await TeamMember.create({
      name,
      position,
      bio,
      email,
      phone,
      order: order || 0,
      published: published !== 'false',
      photoUrl: req.file ? req.file.path : undefined
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: 'Could not add team member.' });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.published !== undefined) updates.published = updates.published !== 'false';
    if (req.file) updates.photoUrl = req.file.path;

    const member = await TeamMember.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!member) return res.status(404).json({ message: 'Team member not found.' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: 'Could not update team member.' });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Team member not found.' });
    res.json({ message: 'Team member deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete team member.' });
  }
};

module.exports = { getPublicTeam, getAllTeam, createTeamMember, updateTeamMember, deleteTeamMember };