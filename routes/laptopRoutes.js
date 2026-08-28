const express = require("express");
const { createOrUpdateLaptop, getLaptops } = require("../controllers/laptopController");

const router = express.Router();

router.post("/", createOrUpdateLaptop);
router.get("/", getLaptops);

module.exports = router;
