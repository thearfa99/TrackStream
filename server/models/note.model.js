const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdTime: { type: Date, default: Date.now },
    completedTime: { type: Date },
    status: { type: String, required: false },
});

module.exports = mongoose.model("Note", noteSchema);
