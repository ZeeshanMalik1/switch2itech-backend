const express = require("express");
const router = express.Router();
const tc = require("../controllers/testimonialController");
const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/restrictTo");

// ── Public ────────────────────────────────────────────────────
// GET  /api/testimonials          — list (filter by ?approved=true, ?project=, ?product=)
// GET  /api/testimonials/:id      — single
router.get("/", tc.getAll);
router.get("/:id", tc.getOne);

// ── Authenticated ─────────────────────────────────────────────
// POST /api/testimonials          — submit a testimonial/review
router.post("/", protect, tc.create);

// PATCH /api/testimonials/:id     — owner or admin edits
router.patch("/:id", protect, tc.update);

// ── Admin only ────────────────────────────────────────────────
// PATCH /api/testimonials/:id/approve  — approve / feature
router.patch("/:id/approve", protect, restrictTo("admin"), tc.approve);

// DELETE /api/testimonials/:id    — remove
router.delete("/:id", protect, restrictTo("admin"), tc.remove);

module.exports = router;
