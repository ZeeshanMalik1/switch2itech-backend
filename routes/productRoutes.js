const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { upload } = require("../config/cloudinary");
const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/restrictTo");

// 1. GET ALL PRODUCTS
router.get("/", productController.getProducts);

// 2. GET SINGLE PRODUCT
router.get("/:id", productController.getProduct);

// 3. CREATE PRODUCT
router.post(
  "/",
  protect, restrictTo("admin"),
  upload.fields([
    { name: "image", maxCount: 5 },
    { name: "video", maxCount: 2 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  productController.createProduct
);

// 4. UPDATE PRODUCT
router.put(
  "/:id",
  protect, restrictTo("admin"),
  upload.fields([
    { name: "image", maxCount: 5 },
    { name: "video", maxCount: 2 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  productController.updateProduct
);

// 5. DELETE PRODUCT
router.delete("/:id", protect, restrictTo("admin"), productController.deleteProduct);

// ── FAQ Sub-resource ──────────────────────────────────────────
// POST   /api/products/:id/faqs          — add FAQ
// PATCH  /api/products/:id/faqs/:faqId   — update FAQ
// DELETE /api/products/:id/faqs/:faqId   — remove FAQ
router.post("/:id/faqs", protect, restrictTo("admin"), productController.addFaq);
router.patch("/:id/faqs/:faqId", protect, restrictTo("admin"), productController.updateFaq);
router.delete("/:id/faqs/:faqId", protect, restrictTo("admin"), productController.deleteFaq);

module.exports = router;

