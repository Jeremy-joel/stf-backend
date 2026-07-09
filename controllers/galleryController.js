const GalleryImage = require('../models/GalleryImage');

const getPublicGallery = async (req, res) => {
  try {
    const images = await GalleryImage.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Could not load gallery.' });
  }
};

const getAllGallery = async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ order: 1, createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Could not load gallery.' });
  }
};

const uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });

    const image = await GalleryImage.create({
      imageUrl: req.file.path,
      caption: req.body.caption || '',
      order: req.body.order || 0,
      published: req.body.published !== 'false'
    });

    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ message: 'Could not upload image.' });
  }
};

const updateGalleryImage = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.published !== undefined) updates.published = updates.published !== 'false';
    if (req.file) updates.imageUrl = req.file.path;

    const image = await GalleryImage.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!image) return res.status(404).json({ message: 'Image not found.' });
    res.json(image);
  } catch (err) {
    res.status(500).json({ message: 'Could not update image.' });
  }
};

const deleteGalleryImage = async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found.' });
    res.json({ message: 'Image deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete image.' });
  }
};

module.exports = { getPublicGallery, getAllGallery, uploadGalleryImage, updateGalleryImage, deleteGalleryImage };
