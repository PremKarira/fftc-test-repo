const mongoose = require('mongoose');

const joiner = new mongoose.Schema({
    interactionId: { type: String, required: true },
    joinedUsersId: [{ type: String}],
    joinedAt: { type: Date, default: Date.now }
});

const joiners = mongoose.model('joiner', joiner);

module.exports = joiners;
