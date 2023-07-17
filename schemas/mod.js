const mongoose = require('mongoose');

const mod = new mongoose.Schema({
  discordId: { type: String, required: true },
  discordUsername: { type: String, required: true },
});

const Modder = mongoose.model('mod', mod);

module.exports = Modder;
