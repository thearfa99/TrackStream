const mongoose = require("mongoose");
// const { v4: uuidv4 } = require('uuid');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true }, // Title of Task
    content: { type: String, required: true }, // Description
    tags: { type: [String], default: [] }, // Tags for easy search
    isPinned: { type: Boolean, required: false }, // Enables pinning
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User creating the task
    createdTime: { type: Date, default: Date.now }, 
    completedTime: { type: Date },
    status: { type: String, required: false }, // To-do, In progress, Complete
    priority: { type: String, required: false }, // Deafault, Low Priority, High Priority
    assignedUsers: { type: String, required: false }, // Assigned to Users or general task
});

module.exports = mongoose.model("Note", noteSchema);
