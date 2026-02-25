const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/user");
const Project = require("../models/project");
const Product = require("../models/product");

dotenv.config();

const seedDummyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding dummy data...");

        // Clear existing data (Optional, but good for fresh seeding)
        // await User.deleteMany({ role: { $ne: "admin" } }); 
        // await Project.deleteMany({});
        // await Product.deleteMany({});

        console.log("Clearing non-admin users, projects, and products...");
        await User.deleteMany({ role: { $ne: "admin" } });
        await Project.deleteMany({});
        await Product.deleteMany({});

        // 1. Seed Developers
        const developers = await User.insertMany([
            {
                name: "Zeeshan Malik",
                email: "zeeshan@switch2itech.com",
                password: "password123",
                role: "developer",
                skills: ["React", "Node.js", "MongoDB", "Framer Motion"],
                profile: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zeeshan"
            },
            {
                name: "Hassan Khalid",
                email: "hassan@switch2itech.com",
                password: "password123",
                role: "developer",
                skills: ["React", "Next.js", "Tailwind CSS", "GSAP"],
                profile: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan"
            }
        ]);
        console.log("Developers seeded.");

        // 2. Seed Clients
        const clients = await User.insertMany([
            {
                name: "John Doe",
                email: "john@client.com",
                password: "password123",
                role: "client",
                company: "Tech Corp",
                address: "New York, USA",
                profile: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
            },
            {
                name: "Jane Smith",
                email: "jane@client.com",
                password: "password123",
                role: "client",
                company: "Design Studio",
                address: "London, UK",
                profile: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
            }
        ]);
        console.log("Clients seeded.");

        // 3. Seed Projects
        const projects = await Project.insertMany([
            {
                name: "E-commerce Platform",
                client: "Tech Corp",
                description: "A full-stack e-commerce solution with real-time inventory tracking.",
                progress: 65,
                imageUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1000",
                milestones: [
                    { title: "Project Setup", isDone: true },
                    { title: "UI Design", isDone: true },
                    { title: "Backend API", isDone: false },
                    { title: "Payment Integration", isDone: false }
                ],
                members: [
                    { name: "Zeeshan Malik", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zeeshan" },
                    { name: "Hassan Khalid", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan" }
                ]
            },
            {
                name: "Portfolio Website",
                client: "Design Studio",
                description: "High-end interactive portfolio with complex animations.",
                progress: 90,
                imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000",
                milestones: [
                    { title: "Concept", isDone: true },
                    { title: "Animations", isDone: true },
                    { title: "Final Polish", isDone: false }
                ],
                members: [
                    { name: "Hassan Khalid", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan" }
                ]
            }
        ]);
        console.log("Projects seeded.");

        // Link Projects to Clients
        await User.findOneAndUpdate({ email: "john@client.com" }, { $push: { assignedProjects: projects[0]._id } });
        await User.findOneAndUpdate({ email: "jane@client.com" }, { $push: { assignedProjects: projects[1]._id } });

        // 4. Seed Products
        await Product.insertMany([
            {
                name: "SaaS Dashboard Template",
                desc: "A premium React-based dashboard template for modern SaaS applications.",
                category: "Template",
                clients: "20+",
                techStack: ["React", "Shadcn UI", "Tailwind"],
                image: "https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=1000",
                thumbnail: "https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=200"
            },
            {
                name: "AI Content Generator",
                desc: "Automated blog post and social media caption generator.",
                category: "Tool",
                clients: "50+",
                techStack: ["Node.js", "OpenAI", "Next.js"],
                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000",
                thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=200"
            }
        ]);
        console.log("Products seeded.");

        console.log("All dummy data seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error(`Error seeding dummy data: ${error.message}`);
        process.exit(1);
    }
};

seedDummyData();
