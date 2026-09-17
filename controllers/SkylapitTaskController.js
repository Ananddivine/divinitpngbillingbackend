const Task = require("../models/SkylapitTaskModel");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");


// Create Task
const createTask = async (req, res) => {
  try {
    const { title, company, serialnumber, companyId, deadline, assignedUser, createdBy, status, department, priority, subtasks, conversations } = req.body;

    // Find the last taskId in the database and increment it properly
    const lastTask = await Task.findOne().sort({ taskId: -1 }); // Get the last created task by highest taskId
    const newTaskId = lastTask ? lastTask.taskId + 1 : 1; // If no task exists, start from 1

    const newTask = new Task({
      taskId: newTaskId, // Correct numerical ID
      title,
      company,
      serialnumber,
      companyId,
      deadline,
      assignedUser,
      createdBy,
      status,
      department,
      priority,
      subtasks,
      conversations
    });

    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });

  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updatedData = req.body;

    // Find the task by taskId and update it
    const updatedTask = await Task.findOneAndUpdate(
      { taskId: taskId }, // Find task by taskId
      { $set: updatedData }, // Update fields
      { new: true } // Return updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// Get All Tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ deleted: { $ne: true } });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get comments for a specific task
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOne({ taskId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ comments: task.conversations || [] });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a comment to a task
const addComment = async (req, res) => {
  try {
    const { taskId, user, text } = req.body;

    const task = await Task.findOne({ taskId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newComment = {
      user,
      text,
      time: new Date().toISOString(),
    };

    task.conversations.push(newComment);
    await task.save();

    res.status(200).json({ message: "Comment added successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { taskId } = req.params;

    // Find the task using the UUID (taskId)
    const updatedTask = await Task.findOneAndUpdate({ taskId }, { status }, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Status updated", task: updatedTask });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  console.log("Received taskId:", taskId); // Debugging step

  try {
    // Search using taskId as a string
    const task = await Task.findOne({ taskId: taskId });

    if (!task) {
      console.log("Task not found in DB"); // Debugging message
      return res.status(404).json({ message: "Task not found" });
    }

    // Soft delete: update the `deleted` flag
    task.deleted = true;
    await task.save();

    res.status(200).json({ message: "Task moved to trash", task });
  } catch (error) {
    console.error("Error moving task to trash:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTaskById = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findOne({ taskId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTodoTaskCount = async (req, res) => {
  try {
    const todoCount = await Task.countDocuments({ status: "TODO", deleted: false }); 
    res.status(200).json({ count: todoCount });
  } catch (error) {
    console.error("Error fetching todo task count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { createTask, getAllTasks, getTaskComments, addComment, updateTaskStatus, deleteTask, getTaskById, updateTask, getTodoTaskCount  };
