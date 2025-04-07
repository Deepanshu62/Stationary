const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = 3001;

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/stationary", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", [path.join(__dirname, "views"), path.join(__dirname, "component")]);
app.use(express.json());
app.use(express.static("public"));



// ✅ Define User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// ✅ Define Product Schema (IN THE SAME FILE)
const ProductSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    category: String,
    discount: String,
});
const Product = mongoose.model("Product", ProductSchema); // ✅ FIX: Defined properly


// ✅ Route to Render Login Page
app.get("/", (req, res) => {
    res.render("login", { message: null });
});
app.get("/landing", (req, res) => {
    res.render("landing", { message: null });
});

// ✅ Route to Render Register Page
app.get("/register", (req, res) => {
    res.render("register", { message: null });
});

// ✅ Route to Render Main Page with Products
app.get("/main", async(req, res) => {
    try {
        const products = await Product.find(); // ✅ Fetch products from MongoDB
        res.render("main", { products, message: null });
    } catch (error) {
        console.error(error);
        res.render("main", { products: [], message: "Error fetching products." });
    }
});

// ✅ Register Route
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
app.get("/users", async(req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.status(200).json(users); // Send user data as JSON response
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});


// ✅ Login Route
app.post("/login", async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.render("login", { message: "Invalid email or password." });
        }
        res.redirect("/main"); // ✅ Redirect to Main Page on Successful Login
    } catch (error) {
        console.error(error);
        res.render("login", { message: "Error during login." });
    }
});

// ✅ Route to Add New Product (API)
// app.post("/products", async(req, res) => {
//     try {
//         const { name, price, image, category, discount } = req.body;
//         const newProduct = new Product({ name, price, image, category, discount });
//         await newProduct.save();
//         res.status(201).json({ message: "Product added successfully!" });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to add product" });
//     }
// });

app.post("/products", async(req, res) => {
    try {
        const { name, price, image, category, discount } = req.body;

        // Check if required fields are present
        if (!name || !price || !image || !category || !discount) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const newProduct = new Product({ name, price, image, category, discount });
        await newProduct.save();

        res.status(201).json({ message: "Product added successfully!" });
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ error: "Failed to add product" });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});