const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  // POST /post
  res.json([
    { id: 1, content: "hello" },
    { id: 1, content: "hello2" },
    { id: 1, content: "hello3" },
  ]);
});

router.delete("/", (req, res) => {
  // DELETE /post
  res.json([{ id: 1 }]);
});

module.exports = router;
