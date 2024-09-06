require("dotenv").config();
const postmark = require("postmark");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");

const { authenticateToken } = require("./utilities.js");
const User = require("./models/user.model.js");
const Note = require("./models/note.model.js");
const config = require("./config.json");

const app = express();

// Postmark client setup
const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

// Password validation function
const validatePassword = (password) => {
    const minLength = 6;
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength || !specialCharPattern.test(password)) {
        return false;
    }
    return true;
};

// Start the server
app.listen(8000, () => {
    console.log('Server started on port 8000');
});

// Connect to MongoDB
mongoose.connect(config.connectionString);

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Basic route
app.get("/", (req, res) => {
    res.json({ data: "hello" });
});

// Create Account API
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName.trim() || !email.trim() || !password.trim()) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ error: true, message: "Password does not meet requirements" });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
        return res.status(400).json({ error: true, message: "User already exists" });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10h" });

    return res.json({ error: false, user, accessToken, message: "Registration Successful" });
});

// Login API
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const userInfo = await User.findOne({ email });
    if (!userInfo) {
        return res.status(400).json({ message: "User not found" });
    }

    if (password !== userInfo.password) {
        return res.status(400).json({ message: "Invalid Credentials" });
    }

    const accessToken = jwt.sign({ user: userInfo }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10h" });

    return res.json({ error: false, message: "Login Successful", email, accessToken });
});

// Get User API
app.get("/get-user", authenticateToken, async (req, res) => {
    const { user } = req.user;

    const isUser = await User.findOne({ _id: user._id });
    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: { fullName: isUser.fullName, email: isUser.email, "_id": isUser._id, createdOn: isUser.createdOn },
        message: "",
    });
});

// Add Note API
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags, assignedUsers, status, priority } = req.body;
    const { user } = req.user;

    if (!title.trim()) {
        return res.status(400).json({ error: true, message: "Title is required!" });
    }

    if (!content || !content.trim()) {
        return res.status(400).json({ error: true, message: "Content is required" });
    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id,
            assignedUsers: assignedUsers || [],
            status: status,
            priority: priority,
        });

        await note.save();

        // Notify assigned users via email
        const assignedUserIds = assignedUsers || [];
        const users = await User.find({ _id: { $in: assignedUserIds } });

        users.forEach(user => {
            postmarkClient.sendEmail({
                From: process.env.FROM_EMAIL, // Your email address
                To: user.email,
                Subject: "Task Assigned",
                TextBody: `Hello ${user.fullName},\n\nYou have been assigned a new task: "${title}".\n\nContent: ${content}\n\nPlease check your tasks for more details.\n\nBest regards,\nYour Team`,
            });
        });

        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Edit Note API
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned, assignedUsers, status, priority } = req.body;
    const { user } = req.user;

    if (!title && !content && !tags && !assignedUsers && !status && !priority) {
        return res.status(400).json({ error: true, message: "No changes provided!" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned !== undefined) note.isPinned = isPinned;
        if (assignedUsers) note.assignedUsers = assignedUsers;
        if (status) note.status = status;
        if (priority) note.priority = priority;

        await note.save();

        // Notify assigned users via email
        const assignedUserIds = assignedUsers || [];
        const users = await User.find({ _id: { $in: assignedUserIds } });

        users.forEach(user => {
            postmarkClient.sendEmail({
                From: process.env.FROM_EMAIL, // Your email address
                To: user.email,
                Subject: "Task Updated",
                TextBody: `Hello ${user.fullName},\n\nThe task "${title}" has been updated.\n\nContent: ${content}\n\nPlease check your tasks for the latest details.\n\nBest regards,\nYour Team`,
            });
        });

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});


// Get All Notes API
app.get("/get-all-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const notes = await Note.find({ userId: user._id })
            .populate('assignedUsers', 'fullName email') // Populate assignedUsers with relevant fields
            .sort({ isPinned: -1 });

        return res.json({
            error: false,
            notes,
            message: "All tasks fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Delete Note API
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({
                error: true,
                message: "Note not found or unauthorized",
            });
        }

        await Note.deleteOne({ _id: noteId, userId: user._id });

        return res.json({
            error: false,
            message: "Note deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Update isPinned Value API
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Search Notes API
app.get("/search-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: true, message: "Search query is required" });
    }

    try {
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { content: { $regex: new RegExp(query, "i") } },
                { tags: { $regex: new RegExp(query, "i") } }
            ],
        });

        return res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes matching the search query retrieved successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

// Get All Users API
app.get("/users", authenticateToken, async (req, res) => {
    try {
        const users = await User.find({}, "_id fullName email"); // Only select relevant fields

        return res.json({
            error: false,
            users: users.map(user => ({
                id: user._id,
                name: user.fullName,
                email: user.email,
            })),
            message: "All users fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});
