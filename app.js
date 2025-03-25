const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/userAuth", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
    res.render("login", { message: null });
});

app.get("/register", (req, res) => {
    res.render("register", { message: null });
});

// Register - Save user to MongoDB
app.post("/register", async(req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.render("register", { message: "User already exists!" });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.render("login", { message: "Registration successful! Please login." });
    } catch (error) {
        console.error(error);
        res.render("register", { message: "Error during registration." });
    }
});

// Login - Validate user from MongoDB
app.post("/login", async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.render("login", { message: "Invalid email or password." });
        }

        res.send("Login successful! Welcome to your dashboard.");
    } catch (error) {
        console.error(error);
        res.render("login", { message: "Error during login." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});