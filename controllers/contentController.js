const SiteContent = require('../models/SiteContent');

// Default text used if a section hasn't been edited by an admin yet -
// matches exactly what's currently hardcoded on the live site, so nothing
// changes visually until an admin actually edits something.
const DEFAULTS = {
  'site-settings': {
    logoUrl: ''
  },
  'hero': {
    title: 'Restoring Hope. Strengthening Families. Transforming Lives.',
    subtitle: 'We support vulnerable children and families across Kenya through education, healthcare, food assistance, empowerment and community development. Together, we can build stronger families and brighter futures.',
    imageUrl: ''
  },
  'who-we-are': {
    intro: 'Save the Family Foundation is a non-profit organization founded in 2016, committed to restoring hope and transforming the lives of vulnerable children and families across Kenya. Our work focuses on four pillars:',
    pillar1Title: 'Safety & Protection',
    pillar1Desc: 'Prevention of, and response to, gender-based violence.',
    pillar2Title: 'Rehabilitation',
    pillar2Desc: 'Drug and substance abuse prevention and rehabilitation.',
    pillar3Title: 'Health & Wellness',
    pillar3Desc: 'HIV/AIDS awareness and community health education.',
    pillar4Title: 'Basic Needs',
    pillar4Desc: 'Access to quality education and essential daily needs.',
    transformingTitle: 'Transforming Lives, Strengthening Families',
    transformingText: 'Save the Family Foundation supports vulnerable and street-connected children in Kenya with education, meals, and family care — helping them grow in safety, dignity, and hope through community-driven, long-term support.',
    whoImage: '',
    transformingImage: ''
  },
  'about': {
    vision: 'A compassionate society where children and youths live with dignity, love and equal opportunities — regardless of their background.',
    mission: 'To empower vulnerable children and youths through rescue, rehabilitation, reintegration, and skills development, enabling them to build a brighter, self-reliant future.',
    values: 'Compassion, Integrity, Respect, Empowerment, Accountability',
    objectives: 'Educate children, Feed families, Empower communities, Protect children, Build partnerships'
  },
  'get-involved': {
    intro: "Your support can change lives. Whether you choose to donate, volunteer, partner with us or share our mission, your support brings hope, opportunity, and lasting change to vulnerable children.",
    journeyTitle: 'Help Us Reach 200+ Children in Mumias',
    journeyText: "Our goal is to reach more than 200 children within Mumias in a year — providing them with a safe environment, food, education, mentorship, and medical and psychosocial support. You are welcome to participate in turning the streets into a launching pad of hope, and help reduce the ever-increasing number of idle and displaced children in the streets."
  }
};

// PUBLIC - the live website calls this to load current text for a section
const getContent = async (req, res) => {
  try {
    const { key } = req.params;
    const record = await SiteContent.findOne({ key });
    res.json(record ? record.data : (DEFAULTS[key] || {}));
  } catch (err) {
    res.status(500).json({ message: 'Could not load content.' });
  }
};

// ADMIN - get raw content for pre-filling the edit form (falls back to defaults too)
const getContentAdmin = async (req, res) => {
  try {
    const { key } = req.params;
    const record = await SiteContent.findOne({ key });
    res.json(record ? record.data : (DEFAULTS[key] || {}));
  } catch (err) {
    res.status(500).json({ message: 'Could not load content.' });
  }
};

// ADMIN - save changes to a section
const updateContent = async (req, res) => {
  try {
    const { key } = req.params;
    const record = await SiteContent.findOneAndUpdate(
      { key },
      { key, data: req.body },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Could not save content.' });
  }
};

// ADMIN - upload/replace a single image within a content section.
// `field` in the form data says WHICH image this is (e.g. "logoUrl",
// "whoImage", "transformingImage") - this lets one section (like "who-we-are")
// hold more than one image.
const updateContentImage = async (req, res) => {
  try {
    const { key } = req.params;
    const { field } = req.body;

    if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });
    if (!field) return res.status(400).json({ message: 'Missing "field" - which image is this?' });

    const existing = await SiteContent.findOne({ key });
    const data = { ...(existing ? existing.data : DEFAULTS[key] || {}), [field]: req.file.path };

    const record = await SiteContent.findOneAndUpdate(
      { key },
      { key, data },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    console.error('updateContentImage error:', err.message);
    res.status(500).json({ message: 'Could not upload image.' });
  }
};

module.exports = { getContent, getContentAdmin, updateContent, updateContentImage };