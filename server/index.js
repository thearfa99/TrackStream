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

// Postmark client set up
const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

//To ensure password lenght of 6 char and 1 special char
const validatePassword = (password) => {
    const minLength = 6;
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
    
    if (password.length < minLength) {
      return false;
    }
    if (!specialCharPattern.test(password)) {
      return false;
    }
    return true;
  };

app.listen(8000, () => {
    console.log('Server started on port 8000');
});

mongoose.connect(config.connectionString);

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
    res.json({ data: "hello" });
});

// Create Account API
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName.trim() || !email.trim() || !password.trim()) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    if (validatePassword(password) === false){
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

    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10h" });

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

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
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
            // isPinned,
            // isComplete: isComplete ?? false,
            // createdTime: new Date(),
            // status,
            // priority,
            // assignedUsers,
        });

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Task added successfully",
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
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    if (!title && !content && !tags) {
        return res.status(400).json({ error: true, message: "No changes provided!" });
    }

    try {
        const note=await Note.findOne({ _id: noteId, userId: user._id });

        if (!note){
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json({
            error:false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        })
    }
});

// Get All Tasks
app.get("/get-all-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

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
})

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

        await Note.deleteOne({ _id: noteId, userId: user._id })

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

// Update isPinned Value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
        const note=await Note.findOne({ _id: noteId, userId: user._id });

        if (!note){
            return res.status(404).json({ error: true, message: "Note not found" });
        }
        
        note.isPinned = isPinned;

        await note.save();

        return res.json({
            error:false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        })
    }
});

module.exports = app;

