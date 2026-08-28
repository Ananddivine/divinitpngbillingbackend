const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    taskId: { type: Number, required: true, unique: true }, // Change to Number
    title: { type: String, required: true },
    company: { type: String, required: true },
    serialnumber: { type: String, required: true },
    companyId: { type: String, required: true },
    deadline: { type: String, required: true },
    assignedUser: { type: String, required: true },
    createdBy: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["TODO", "PROCESSING", "FAILED", "BLOCKED", "DONE"], // Updated statuses
      default: "TODO",
    },
    department: { type: String, required: true },
    priority: {
      type: String,
      enum: ["HIGHEST", "HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
    },

    subtasks: [
      {
        id: String,
        status: String,
        title: String,
        connect: String,
        date: String,
        priority: String,
      },
    ],

    conversations: [
      {
        user: String,
        time: String,
        text: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
