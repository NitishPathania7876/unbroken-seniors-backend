const { sequelize } = require("../db/db");
const EndUser = require("../models/endUserModal")(sequelize);
const { sendEmail } = require("../utils/emailService");
const { otpEmailTemplate } = require("../utils/emailTemplates");
const { generateOTP, generateEndUserId } = require("../utils/helperFunctions");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const LoginWithEmailOTP = async (req, res) => {
  const { email, name = "" } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    let user = await EndUser.findOne({ where: { email } });

    const now = new Date();

    // If user exists
    if (user) {
      const otpCreatedAt = user.otp_CreatedAt ? new Date(user.otp_CreatedAt) : null;
      const diffInMinutes = otpCreatedAt ? (Date.now() - otpCreatedAt.getTime()) / (1000 * 60) : Infinity;

      // If OTP expired and user not verified: delete user and re-create later
      if (diffInMinutes > 2 && !user.isVerified) {
        await user.destroy();
        user = null;
      }
      // If OTP expired but user verified: regenerate and send new OTP
      else if (diffInMinutes > 2 && user.isVerified) {
        user.otp = await generateOTP();
        user.otp_CreatedAt = now;
        await user.save();
      }
      // If OTP exists and still valid: send conflict message
      else if (user.otp && otpCreatedAt && diffInMinutes <= 2) {
        return res.status(409).json({
          error: "One time Password already sent and valid for 2 minutes. Please check your email.",
        });
      }
      // Fallback: OTP missing or malformed, re-generate
      else {
        user.otp = await generateOTP();
        user.otp_CreatedAt = now;
        await user.save();
      }
    }

    // If user doesn't exist (was destroyed above or never created)
    if (!user) {
      const otp = await generateOTP();
      user = await EndUser.create({
        email,
        userId: await generateEndUserId(),
        otp,
        otp_CreatedAt: now,
      });
    }

    // Send OTP via email
    const html = await otpEmailTemplate(user.otp, name);
    await sendEmail({
      to: email,
      subject: "Your Rexpt.in Login One time Password",
      html,
      otp: user.otp,
    });

    return res.status(200).json({
      message: "One time Password sent successfully",
      email,
      verifiedStatus: user.isVerified,
    });
  } catch (err) {
    console.error("Error in LoginWithEmailOTP:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
};// Function to verify OTP and log in user
const verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const user = await EndUser.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ageMinutes = (Date.now() - new Date(user.otp_CreatedAt)) / (1000 * 60);

    if (ageMinutes > 2) {
      user.otp = null;
      user.otp_CreatedAt = null;
      await user.save();

      return res.status(410).json({ error: "OTP expired. Please request a new one." });
    }

    if (otp !== user.otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    user.otp = null;
    user.otp_CreatedAt = null;
    user.isVerified = true;
    user.activeStatus = true;
    await user.save();

    const token = jwt.sign(
      { id: user.userId, email, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user.userId,
        email: user.email,
        profile: user.profilePicture || null,
        name: user.name || null,
      },
    });
  } catch (err) {
    console.error("Error in verifyEmailOTP:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await EndUser.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Remove password before sending back
    const safeUser = { ...user.toJSON() };
    delete safeUser.password;

    // Generate token
    const token = jwt.sign(
      { id: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

module.exports = {
  LoginWithEmailOTP,
  verifyEmailOTP,
  login
};
