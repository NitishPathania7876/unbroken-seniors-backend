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
const leadRoutes = require('./routes/leadInqueryRoutes');
app.use('/api/auth', authRoutes);
const providerOnboarding = require('./routes/providerOnboardingRoutes');
const endUserRoutes = require('./routes/endUserRoutes');
const providerSearch=require("./routes/providerSearchRoutes")
//enduser Routes    
app.use('/api/endusers', endUserRoutes);
//provider Routes
app.use('/api/onboarding', providerOnboarding);
app.use('/api/providers',providerSearch );
app.use('/api', leadRoutes);



module.exports = { app };