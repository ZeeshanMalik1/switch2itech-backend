const Project = require("../models/project");
const Milestone = require("../models/milestone");
const Module = require("../models/module");
const Task = require("../models/task");
const User = require("../models/user");
const { upload } = require("../config/cloudinary");

// =============================================
// PROJECT CRUD
// =============================================

// @desc    Create new project
// @route   POST /api/projects
// @access  Private — Admin, Manager
exports.createProject = async (req, res) => {
    try {
        const projectData = { ...req.body };

        if (req.files) {
            if (req.files.coverImage) projectData.coverImage = req.files.coverImage[0].path;
            if (req.files.demoVideo) projectData.demoVideo = req.files.demoVideo[0].path;
        }

        const project = await Project.create(projectData);
        res.status(201).json({ status: "success", data: project });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Get all projects (with populated client, manager, teamMembers)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate("clients", "name email company profile")
            .populate("manager", "name email")
            .populate("teamMembers", "name profile role");

        res.status(200).json({ status: "success", count: projects.length, data: projects });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Get single project with all milestones & modules
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("clients", "name email company profile")
            .populate("manager", "name email")
            .populate("teamMembers", "name profile role");

        if (!project) return res.status(404).json({ status: "error", message: "Project not found" });

        const milestones = await Milestone.find({ project: project._id });
        const modules = await Module.find({ project: project._id }).populate("assignedTo", "name profile");

        res.status(200).json({ status: "success", data: { project, milestones, modules } });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Update project
// @route   PATCH /api/projects/:id
// @access  Private — Admin, Manager
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!project) return res.status(404).json({ status: "error", message: "Project not found" });

        res.status(200).json({ status: "success", data: project });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Delete project and all its children (cascade)
// @route   DELETE /api/projects/:id
// @access  Private — Admin only
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ status: "error", message: "Project not found" });

        await Task.deleteMany({ project: project._id });
        await Module.deleteMany({ project: project._id });
        await Milestone.deleteMany({ project: project._id });
        await project.deleteOne();

        res.status(200).json({ status: "success", message: "Project and all children deleted" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// =============================================
// MILESTONE CRUD
// =============================================

// @desc    Create milestone for a project
// @route   POST /api/projects/:projectId/milestones
// @access  Private — Admin, Manager
exports.createMilestone = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ status: "error", message: "Project not found" });

        const milestone = await Milestone.create({ ...req.body, project: project._id });
        res.status(201).json({ status: "success", data: milestone });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Get all milestones for a project
// @route   GET /api/projects/:projectId/milestones
// @access  Private
exports.getMilestones = async (req, res) => {
    try {
        const milestones = await Milestone.find({ project: req.params.projectId });
        res.status(200).json({ status: "success", count: milestones.length, data: milestones });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Update a milestone
// @route   PATCH /api/projects/:projectId/milestones/:milestoneId
// @access  Private — Admin, Manager
exports.updateMilestone = async (req, res) => {
    try {
        const milestone = await Milestone.findOneAndUpdate(
            { _id: req.params.milestoneId, project: req.params.projectId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!milestone) return res.status(404).json({ status: "error", message: "Milestone not found" });

        res.status(200).json({ status: "success", data: milestone });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Delete a milestone and its modules/tasks
// @route   DELETE /api/projects/:projectId/milestones/:milestoneId
// @access  Private — Admin only
exports.deleteMilestone = async (req, res) => {
    try {
        const milestone = await Milestone.findById(req.params.milestoneId);
        if (!milestone) return res.status(404).json({ status: "error", message: "Milestone not found" });

        await Task.deleteMany({ milestone: milestone._id });
        await Module.deleteMany({ milestone: milestone._id });
        await milestone.deleteOne();

        res.status(200).json({ status: "success", message: "Milestone and its modules/tasks deleted" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// =============================================
// MODULE CRUD
// =============================================

// @desc    Create module under a milestone
// @route   POST /api/projects/:projectId/milestones/:milestoneId/modules
// @access  Private — Admin, Manager
exports.createModule = async (req, res) => {
    try {
        const milestone = await Milestone.findById(req.params.milestoneId);
        if (!milestone) return res.status(404).json({ status: "error", message: "Milestone not found" });

        const module = await Module.create({
            ...req.body,
            milestone: milestone._id,
            project: req.params.projectId,
        });

        res.status(201).json({ status: "success", data: module });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Get all modules in a milestone
// @route   GET /api/projects/:projectId/milestones/:milestoneId/modules
// @access  Private
exports.getModules = async (req, res) => {
    try {
        const modules = await Module.find({ milestone: req.params.milestoneId })
            .populate("assignedTo", "name profile role");

        res.status(200).json({ status: "success", count: modules.length, data: modules });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Update a module (e.g., status, assignee)
// @route   PATCH /api/projects/:projectId/milestones/:milestoneId/modules/:moduleId
// @access  Private — Admin, Manager, Developer
exports.updateModule = async (req, res) => {
    try {
        const module = await Module.findByIdAndUpdate(req.params.moduleId, req.body, {
            new: true,
            runValidators: true,
        }).populate("assignedTo", "name profile");

        if (!module) return res.status(404).json({ status: "error", message: "Module not found" });

        res.status(200).json({ status: "success", data: module });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// =============================================
// TASK CRUD
// =============================================

// @desc    Create a task under a module
// @route   POST /api/projects/:projectId/milestones/:milestoneId/modules/:moduleId/tasks
// @access  Private
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create({
            ...req.body,
            module: req.params.moduleId,
            milestone: req.params.milestoneId,
            project: req.params.projectId,
            reporter: req.user._id,
        });

        res.status(201).json({ status: "success", data: task });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Get all tasks in a module
// @route   GET /api/projects/:projectId/milestones/:milestoneId/modules/:moduleId/tasks
// @access  Private
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ module: req.params.moduleId })
            .populate("assignee", "name profile")
            .populate("reporter", "name");

        res.status(200).json({ status: "success", count: tasks.length, data: tasks });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Update a task (status, assignee, etc.)
// @route   PATCH /api/projects/:projectId/milestones/:milestoneId/modules/:moduleId/tasks/:taskId
// @access  Private
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, {
            new: true,
            runValidators: true,
        })
            .populate("assignee", "name profile")
            .populate("reporter", "name");

        if (!task) return res.status(404).json({ status: "error", message: "Task not found" });

        res.status(200).json({ status: "success", data: task });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/projects/:projectId/milestones/:milestoneId/modules/:moduleId/tasks/:taskId
// @access  Private — Admin, Manager
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.taskId);
        if (!task) return res.status(404).json({ status: "error", message: "Task not found" });

        res.status(200).json({ status: "success", message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// =============================================
// ASSIGNMENT ENDPOINTS
// =============================================

// @desc    Assign client, manager, and/or team members (developers) to a project
// @route   PATCH /api/projects/:id/assign
// @access  Private — Admin only
// @body    { client, manager, teamMembers: [userId, ...], action: "add"|"remove" }
exports.assignProjectTeam = async (req, res) => {
    try {
        // clients: array of userIds to add/remove
        // action: "add" | "remove" (applies to both clients and teamMembers)
        const { clients = [], manager, teamMembers = [], action = "add" } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ status: "error", message: "Project not found" });

        // ── Clients ───────────────────────────────────────────────
        if (clients.length > 0) {
            if (action === "add") {
                clients.forEach((id) => {
                    const str = id.toString();
                    if (!project.clients.map((c) => c.toString()).includes(str)) {
                        project.clients.push(id);
                    }
                });
                await User.updateMany(
                    { _id: { $in: clients } },
                    { $addToSet: { assignedProjects: project._id } }
                );
            } else if (action === "remove") {
                const removeSet = clients.map(String);
                project.clients = project.clients.filter((c) => !removeSet.includes(c.toString()));
                await User.updateMany(
                    { _id: { $in: clients } },
                    { $pull: { assignedProjects: project._id } }
                );
            }
        }

        // ── Manager ───────────────────────────────────────────────
        if (manager) project.manager = manager;

        // ── Team Members ──────────────────────────────────────────
        if (teamMembers.length > 0) {
            if (action === "add") {
                teamMembers.forEach((id) => {
                    if (!project.teamMembers.map((m) => m.toString()).includes(id.toString())) {
                        project.teamMembers.push(id);
                    }
                });
                await User.updateMany(
                    { _id: { $in: teamMembers } },
                    { $addToSet: { assignedProjects: project._id } }
                );
            } else if (action === "remove") {
                const removeSet = teamMembers.map(String);
                project.teamMembers = project.teamMembers.filter(
                    (id) => !removeSet.includes(id.toString())
                );
                await User.updateMany(
                    { _id: { $in: teamMembers } },
                    { $pull: { assignedProjects: project._id } }
                );
            }
        }

        await project.save();

        const updated = await Project.findById(project._id)
            .populate("clients", "name email role profile")
            .populate("manager", "name email role")
            .populate("teamMembers", "name email role profile");

        res.status(200).json({ status: "success", data: updated });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Assign a milestone to a manager or lead developer
// @route   PATCH /api/projects/:projectId/milestones/:milestoneId/assign
// @access  Private — Admin, Manager
// @body    { assignedTo: userId }
exports.assignMilestone = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        if (!assignedTo) {
            return res.status(400).json({ status: "error", message: "assignedTo (userId) is required" });
        }

        const user = await User.findById(assignedTo);
        if (!user) return res.status(404).json({ status: "error", message: "User not found" });

        const milestone = await Milestone.findOneAndUpdate(
            { _id: req.params.milestoneId, project: req.params.projectId },
            { assignedTo },
            { new: true }
        ).populate("assignedTo", "name email role profile");

        if (!milestone) return res.status(404).json({ status: "error", message: "Milestone not found" });

        res.status(200).json({ status: "success", data: milestone });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Assign a module to a developer
// @route   PATCH /api/projects/:projectId/milestones/:milestoneId/modules/:moduleId/assign
// @access  Private — Admin, Manager
// @body    { assignedTo: userId }
exports.assignModule = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        if (!assignedTo) {
            return res.status(400).json({ status: "error", message: "assignedTo (userId) is required" });
        }

        const user = await User.findById(assignedTo);
        if (!user) return res.status(404).json({ status: "error", message: "User not found" });

        const module = await Module.findByIdAndUpdate(
            req.params.moduleId,
            { assignedTo },
            { new: true }
        ).populate("assignedTo", "name email role profile");

        if (!module) return res.status(404).json({ status: "error", message: "Module not found" });

        res.status(200).json({ status: "success", data: module });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Assign a task to a developer (assignee)
// @route   PATCH /api/projects/:projectId/milestones/:milestoneId/modules/:moduleId/tasks/:taskId/assign
// @access  Private — Admin, Manager
// @body    { assignee: userId }
exports.assignTask = async (req, res) => {
    try {
        const { assignee } = req.body;
        if (!assignee) {
            return res.status(400).json({ status: "error", message: "assignee (userId) is required" });
        }

        const user = await User.findById(assignee);
        if (!user) return res.status(404).json({ status: "error", message: "User not found" });

        const task = await Task.findByIdAndUpdate(
            req.params.taskId,
            { assignee },
            { new: true }
        )
            .populate("assignee", "name email role profile")
            .populate("reporter", "name email");

        if (!task) return res.status(404).json({ status: "error", message: "Task not found" });

        res.status(200).json({ status: "success", data: task });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// =============================================
// FAQ SUB-RESOURCE
// =============================================

// @desc    Add a FAQ to a project
// @route   POST /api/projects/:id/faqs
// @access  Private — Admin, Manager
exports.addFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ status: "error", message: "question and answer are required" });
        }

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $push: { faqs: { question, answer } } },
            { new: true, runValidators: true }
        );

        if (!project) return res.status(404).json({ status: "error", message: "Project not found" });

        res.status(200).json({ status: "success", data: project });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Update a FAQ on a project
// @route   PATCH /api/projects/:id/faqs/:faqId
// @access  Private — Admin, Manager
exports.updateFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const updateFields = {};
        if (question) updateFields["faqs.$.question"] = question;
        if (answer) updateFields["faqs.$.answer"] = answer;

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, "faqs._id": req.params.faqId },
            { $set: updateFields },
            { new: true }
        );

        if (!project) return res.status(404).json({ status: "error", message: "Project or FAQ not found" });

        res.status(200).json({ status: "success", data: project });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Delete a FAQ from a project
// @route   DELETE /api/projects/:id/faqs/:faqId
// @access  Private — Admin, Manager
exports.deleteFaq = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $pull: { faqs: { _id: req.params.faqId } } },
            { new: true }
        );

        if (!project) return res.status(404).json({ status: "error", message: "Project not found" });

        res.status(200).json({ status: "success", data: project });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};
