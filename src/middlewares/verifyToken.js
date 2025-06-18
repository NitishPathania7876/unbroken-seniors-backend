// const jwt = require("jsonwebtoken");
// const EndUser = require('../models/endUserModal')(sequelize);
// exports.verifyToken = (req, res) => {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1];
//     if (!token) return res.json({ valid: false });
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) return res.json({ valid: false });
//         res.json({ valid: true });
//     });
// }
const { sequelize } = require("../db/db");
const jwt = require("jsonwebtoken");
const EndUser = require('../models/endUserModal')(sequelize);
exports.verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.json({ valid: false });

        // Step 1: Verify the token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.json({ valid: false });
            // Step 2: Token is valid, now check user existence in DB
            const user = await EndUser.findOne({ where: { userId: decoded.id } });

            if (!user) {
                return res.json({ valid: false }); // User doesn't exist anymore
            }

            // Optionally check if user is deactivated
            // if (user.status === 'deactivated') return res.json({ valid: false });

            // Step 3: Token valid and user exists
            res.json({ valid: true });
        });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(500).json({ valid: false });
    }
};
