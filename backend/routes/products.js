const express = require("express");
const Product = require("../schema/Product");

const router = express.Router();

// GET /products
// supports: ?page=1&limit=10&q=searchText
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "12", 10)));
    const q = (req.query.q || "").trim();

    const filter = {};
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: re }, { description: re }];
    }

    const total = await Product.countDocuments(filter);
    let products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // If images are Backblaze URLs and bucket is private, return presigned URLs
    const { getPresignedUrl } = require('../config/backblaze');
    const b2Host = (process.env.B2_S3_ENDPOINT || '').replace(/^https?:\/\//, '');
    const bucket = process.env.B2_BUCKET;

    const productsOut = [];
    for (const p of products) {
      const obj = p.toObject();
      if (obj.image && /^https?:\/\//i.test(obj.image) && bucket && obj.image.includes(bucket)) {
        try {
          // extract key from URL path
          const parsed = new URL(obj.image);
          const key = parsed.pathname.replace(/^\//, '');
          const presigned = await getPresignedUrl(key, 300);
          obj.image = presigned;
        } catch (e) {
          console.warn('Could not create presigned url for', obj.image, e && e.message ? e.message : e);
        }
      }
      
      // Also process images array if present
      if (obj.images && Array.isArray(obj.images)) {
        const presignedImages = [];
        for (const img of obj.images) {
          if (img && /^https?:\/\//i.test(img) && bucket && img.includes(bucket)) {
            try {
              const parsed = new URL(img);
              const key = parsed.pathname.replace(/^\//, '');
              const presigned = await getPresignedUrl(key, 300);
              presignedImages.push(presigned);
            } catch (e) {
              console.warn('Could not create presigned url for image', img, e && e.message ? e.message : e);
              presignedImages.push(img);
            }
          } else {
            presignedImages.push(img);
          }
        }
        obj.images = presignedImages;
      }
      
      productsOut.push(obj);
    }

    res.json({ products: productsOut, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    // If images are Backblaze URLs and bucket is private, return presigned URLs
    const { getPresignedUrl } = require('../config/backblaze');
    const bucket = process.env.B2_BUCKET;
    
    const obj = product.toObject();
    
    // Process main image
    if (obj.image && /^https?:\/\//i.test(obj.image) && bucket && obj.image.includes(bucket)) {
      try {
        const parsed = new URL(obj.image);
        const key = parsed.pathname.replace(/^\//, '');
        const presigned = await getPresignedUrl(key, 300);
        obj.image = presigned;
      } catch (e) {
        console.warn('Could not create presigned url for main image', obj.image, e && e.message ? e.message : e);
      }
    }
    
    // Process images array
    if (obj.images && Array.isArray(obj.images)) {
      const presignedImages = [];
      for (const img of obj.images) {
        if (img && /^https?:\/\//i.test(img) && bucket && img.includes(bucket)) {
          try {
            const parsed = new URL(img);
            const key = parsed.pathname.replace(/^\//, '');
            const presigned = await getPresignedUrl(key, 300);
            presignedImages.push(presigned);
          } catch (e) {
            console.warn('Could not create presigned url for image', img, e && e.message ? e.message : e);
            presignedImages.push(img); // fallback to original URL
          }
        } else {
          presignedImages.push(img);
        }
      }
      obj.images = presignedImages;
    }
    
    res.json({ product: obj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
