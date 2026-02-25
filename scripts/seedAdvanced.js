const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/user");
const Project = require("../models/project");

dotenv.config();

const seedAdvancedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for advanced seeding...");

        // 1. Clear Data
        await Project.deleteMany({});
        // We keep admins, but clear other users to avoid email conflicts
        await User.deleteMany({ role: { $ne: "admin" } });

        // 2. Create Developers
        const dev1 = await User.create({
            name: "Zeeshan Malik",
            email: "zeeshan@switch2itech.com",
            password: "password123",
            role: "developer",
            skills: ["React", "Express", "Node.js"]
        });

        const dev2 = await User.create({
            name: "Hassan Khalid",
            email: "hassan@switch2itech.com",
            password: "password123",
            role: "developer",
            skills: ["GSAP", "Framer Motion", "Tailwind"]
        });

        // 3. Create Client
        const client = await User.create({
            name: "Global Tech Solutions",
            email: "contact@globaltech.com",
            password: "password123",
            role: "client",
            company: "Global Tech"
        });

        // 4. Create Project with Milestones and Modules
        const project = await Project.create({
            name: "Switch2iTech ERP",
            description: "Advanced internal management system with role-based access.",
            client: client._id,
            members: [dev1._id, dev2._id],
            milestones: [
                {
                    title: "Infrastructure & Auth",
                    description: "Database setup and environment configuration.",
                    modules: [
                        { name: "Environment Setup", isDone: true, assignedTo: dev1._id },
                        { name: "JWT Authentication", isDone: false, assignedTo: dev1._id }
                    ]
                },
                {
                    title: "Project Management Core",
                    description: "CRUD for projects, milestones and modules.",
                    modules: [
                        { name: "Project Models", isDone: true, assignedTo: dev1._id },
                        { name: "Milestone Logic", isDone: true, assignedTo: dev2._id },
                        { name: "Progress Virtuals", isDone: false, assignedTo: dev2._id }
                    ]
                }
            ]
        });

        console.log(`Seeded Project: ${project.name}`);
        console.log(`Initial Progress: ${project.progress}%`);

        process.exit(0);
    } catch (error) {
        console.error(`Error in advanced seeding: ${error.message}`);
        process.exit(1);
    }
};

seedAdvancedData();
