const mongoose = require('mongoose');

const threadUser = new mongoose.Schema({
    discordId: { type: String, required: true },
    threadId: { type: String, required: true },
    reason: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
});

const threadUsers = mongoose.model('threadUser', threadUser);

module.exports = threadUsers;
