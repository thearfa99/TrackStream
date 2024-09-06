const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true }, // Title of Task
    content: { type: String, required: false, default: "" }, // Description
    tags: { type: [String], default: [] }, // Tags for easy search
    isPinned: { type: Boolean, default: false }, // Enables pinning
    isComplete: { type: Boolean, default: false }, // Task Complete or Incomplete
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User creating the task
    createdOn: { type: Date, default: Date.now }, 
    completedTime: { type: Date },
    status: { type: String, enum: ["To-Do", "In Progress", "Review", "Complete"], default: "To-Do" }, // Add status field
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" }, // Add priority field
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of assigned user IDs
});

module.exports = mongoose.model("Note", noteSchema);
