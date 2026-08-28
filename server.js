require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios'); 
const { ensureUploadDirExists } = require('./utils/fileUtils');  // File utility for ensuring upload directory
const errorHandler = require('./middleware/errorHandler');  // Global error handler
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const fs = require('fs');
const connectDB = require('./config/db');   


// Import route files
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const fileupload = require('./routes/fileUploadRoute')

const productRoutes = require('./routes/productRoutes');
const userFileRoutes = require('./routes/userfileRoutes');  // Ensure this path is correct
const issueRoutes = require('./routes/issueRoutes');
const deviceRoutes = require("./routes/deviceRoutes");
const invoiceRoutes = require("./routes/DivineitpnginvoiceRoutes");


const emailRoutes = require('./routes/emailRoutes');
const DivineitpngmailRoutes = require('./routes/DivineitpngmailRoutes');
const DivineitpngRoutes = require('./routes/DivineitpngRoutes');
const DivineitpngstockRoutes = require('./routes/DivineitpngstockRoutes');
const laptopRoutes = require("./routes/laptopRoutes");
const trashRoutes = require("./routes/trashRoutes");
const DivineitpngTaskRoutes = require("./routes/DivineitpngTaskRoutes");
const DivineitpngPoRoutes = require("./routes/DivineitpngPoRoutes");
const Divineitpngreceiptroutes = require("./routes/Divineitpngreceiptroutes");
const { initializeMonthlyInvoiceReportScheduler } = require("./services/monthlyInvoiceReportService");
const { connect } = require('http2');


// Create the express app
 const app = express();
const PORT = process.env.PORT || 5000;
connectDB(); 
initializeMonthlyInvoiceReportScheduler();

const corsOptions = {
  origin: [
    "https://billing.divineitpng.com",
    "http://localhost:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "auth-token",
    "hemail",
    "uniqToken",
    "User-Email",
  ],
};

app.use(cors(corsOptions));



const invoiceDir = path.join(__dirname, "uploads", "invoices");

if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir, { recursive: true });
}



app.use(express.json());  // For parsing JSON

app.use(bodyParser.urlencoded({ extended: true }));  // For parsing URL-encoded bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'Productimages', 'images')));

// MongoDB connection
// Connect to MongoDB

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
ensureUploadDirExists(uploadDir);

// Use route handlers
app.use('/api/orders', orderRoutes);   
app.use('/api/admin', adminRoutes);   
app.use('/api/users', userRoutes);     
app.use('/api/files', fileRoutes);    
app.use('/api/products', productRoutes);
app.use('/api/files', userFileRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/fileupload', fileupload);
app.use("/api", deviceRoutes);
app.use("/api/invoices", invoiceRoutes);

app.use('/api', emailRoutes);
app.use('/api', DivineitpngmailRoutes);
app.use('/api', DivineitpngRoutes);
app.use('/api', DivineitpngPoRoutes);
app.use('/api', DivineitpngstockRoutes);

app.use('/api', trashRoutes);
app.use("/api/laptop", laptopRoutes);

app.use('/api/task', DivineitpngTaskRoutes);
app.use('/api/receipts', Divineitpngreceiptroutes);



// Global error handling middleware (optional)
app.use(errorHandler);

// 🚀 **Keep-Alive Mechanism** (Prevents Render from Sleeping)
app.get("/keep-alive", (req, res) => {
  res.json({ message: "Server is alive!" });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing server before starting a new one.`);
    process.exit(1);
  }

  console.error('Server failed to start:', error.message);
  process.exit(1);
});


