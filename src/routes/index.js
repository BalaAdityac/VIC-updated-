const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");

const router = express.Router();

router.use("/auth", authRoutes);

// Future modules mount here, e.g.:
// router.use("/student", studentRoutes);
// router.use("/jobs", jobRoutes);

module.exports = router;
