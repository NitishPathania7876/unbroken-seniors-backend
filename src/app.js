const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/db');
const path = require('path');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.static("public"));
//auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
//enduser Routes    
const endUserRoutes = require('./routes/endUserRoutes');
app.use('/api/endusers', endUserRoutes);






module.exports = { app };