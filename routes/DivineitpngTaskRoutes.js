const express = require("express");
const router = express.Router();
const { createTask, getAllTasks, addComment, getTaskComments, updateTaskStatus, deleteTask, getTaskById, updateTask, getTodoTaskCount } = require("../controllers/DivineitpngTaskController");
const verifyUniqTokenMiddleware = require("../middleware/verifyUniqTokenMiddleware");



// Route to create a new task
router.post("/create", createTask);

// Route to fetch all tasks
router.get("/all", getAllTasks);

router.get("/comments/:taskId", getTaskComments);

router.put("/update-status/:taskId", updateTaskStatus);

router.post("/comment", addComment);

router.delete("/deleteTask/:taskId", verifyUniqTokenMiddleware, deleteTask);

router.get("/task/:taskId", getTaskById);

router.put("/update/:taskId", updateTask);
  
router.get("/todo-count", getTodoTaskCount);

module.exports = router;
