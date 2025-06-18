require('dotenv').config();
const {app} = require('./src/app');
const express = require('express');
const path = require('path');
const connectDB = require('./src/db/db').connectDB;
// const models = require('./src/models');
const PORT = process.env.PORT || 2512;
// Serve static files
app.use(express.static("public"));
app.use(express.static(path.resolve(__dirname, "./build")));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "./build", "index.html"));
});
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
