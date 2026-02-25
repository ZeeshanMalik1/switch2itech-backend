const express = require("express");
const router = express.Router();
const pc = require("../controllers/projectController");
const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/restrictTo");
const { upload } = require("../config/cloudinary");

// All project routes require authentication
router.use(protect);

// ── PROJECTS ──────────────────────────────────────────────────
router
    .route("/")
    .get(pc.getProjects)
    .post(
        restrictTo("admin", "manager"),
        upload.fields([
            { name: "coverImage", maxCount: 1 },
            { name: "demoVideo", maxCount: 1 },
        ]),
        pc.createProject
    );

router
    .route("/:id")
    .get(pc.getProjectById)
    .patch(restrictTo("admin", "manager"), pc.updateProject)
    .delete(restrictTo("admin"), pc.deleteProject);

// ── MILESTONES ────────────────────────────────────────────────
router
    .route("/:projectId/milestones")
    .get(pc.getMilestones)
    .post(restrictTo("admin", "manager"), pc.createMilestone);

router
    .route("/:projectId/milestones/:milestoneId")
    .patch(restrictTo("admin", "manager"), pc.updateMilestone)
    .delete(restrictTo("admin"), pc.deleteMilestone);

// ── MODULES ───────────────────────────────────────────────────
router
    .route("/:projectId/milestones/:milestoneId/modules")
    .get(pc.getModules)
    .post(restrictTo("admin", "manager"), pc.createModule);

router
    .route("/:projectId/milestones/:milestoneId/modules/:moduleId")
    .patch(restrictTo("admin", "manager", "developer"), pc.updateModule);

// ── TASKS ─────────────────────────────────────────────────────
router
    .route("/:projectId/milestones/:milestoneId/modules/:moduleId/tasks")
    .get(pc.getTasks)
    .post(pc.createTask);

router
    .route("/:projectId/milestones/:milestoneId/modules/:moduleId/tasks/:taskId")
    .patch(pc.updateTask)
    .delete(restrictTo("admin", "manager"), pc.deleteTask);

// ── ASSIGNMENTS ───────────────────────────────────────────────
// body: { clients: [userId, ...], manager, teamMembers: [...], action: "add"|"remove" }
router.patch("/:id/assign", restrictTo("admin"), pc.assignProjectTeam);

// Assign milestone to a manager or lead developer
router.patch("/:projectId/milestones/:milestoneId/assign", restrictTo("admin", "manager"), pc.assignMilestone);

// Assign module to a developer
router.patch("/:projectId/milestones/:milestoneId/modules/:moduleId/assign", restrictTo("admin", "manager"), pc.assignModule);

// Assign task to a developer
router.patch("/:projectId/milestones/:milestoneId/modules/:moduleId/tasks/:taskId/assign", restrictTo("admin", "manager"), pc.assignTask);

// ── FAQS ──────────────────────────────────────────────────────
// POST   /api/projects/:id/faqs           — add FAQ
// PATCH  /api/projects/:id/faqs/:faqId    — update FAQ
// DELETE /api/projects/:id/faqs/:faqId    — remove FAQ
router.post("/:id/faqs", restrictTo("admin", "manager"), pc.addFaq);
router.patch("/:id/faqs/:faqId", restrictTo("admin", "manager"), pc.updateFaq);
router.delete("/:id/faqs/:faqId", restrictTo("admin", "manager"), pc.deleteFaq);

module.exports = router;

