const express = require('express');
const cors = require('cors');
require("dotenv").config();
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors({
  origin: ['http://localhost:3000', 'https://arefriz.com'],
}));
app.use(express.json());
app.use('/uploads', require('express').static('uploads'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/admin/orders', require('./routes/adminOrderRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));

const { protect } = require('./middleware/authMiddleware');
app.get('/api/test', protect, (req, res) => {
  res.json({ message: 'Protected route working', user: req.user });
});

const nodemailer = require("nodemailer");

app.get("/api/test-email", async (req, res) => { 
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `ARefriz" <process.env.EMAIL_USER>`,
      to: "anmolkirtiwardhan@gmail.com", // ← PUT YOUR EMAIL
      subject: "Test Email from arefriz",
      html: "<h1>Email working 🎉</h1>"
    });

    res.send("Email sent successfully");
  } catch (error) {
    console.error(error);
    res.send("Error sending email");
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'API running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



