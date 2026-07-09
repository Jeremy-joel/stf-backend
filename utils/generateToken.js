const jwt = require('jsonwebtoken');

// Creates a login token for an admin, valid for 12 hours
const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '12h' });
};

module.exports = generateToken;
