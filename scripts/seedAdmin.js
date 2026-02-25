const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/user");

// Load env vars
dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to Database
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        const adminEmail = "admin@switch2itech.com";

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        // Create Admin User
        const admin = new User({
            name: "Super Admin",
            email: adminEmail,
            password: "adminPassword123",
            role: "admin",
            profile: "System Administrator",
            phoneNo: "0000000000",
            company: "Switch2iTech",
            address: "Main Office"
        });

        await admin.save();

        console.log("Admin user seeded successfully!");
        console.log(`Email: ${adminEmail}`);
        console.log("Password: adminPassword123 (Please change this after first login)");

        process.exit(0);
    } catch (error) {
        console.error(`Error seeding admin: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
