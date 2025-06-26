const express = require('express');
const router = express.Router();
const {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  getAllUsers,
  updateProfilePicture
} = require('./../controllers/endUserController');
const authMiddleware = require('../middlewares/authMiddleware');
const { verifyToken } = require('../middlewares/verifyToken');
const upload   =require('./../middlewares/multer')

router.post('/users', createUser);
router.post('/users/login', loginUser);
router.get('/users/:userId', getUser);
router.put('/users/:userId', upload.single("profilePicture") ,  updateUser);
router.delete('/users/:userId', deleteUser);
router.get('/getAllUsers',authMiddleware, getAllUsers);
router.post("/verifyToken",verifyToken)
router.patch('/user/update_profile_picture/:userId',
  upload.single('profilePicture'),     
  updateProfilePicture
);
module.exports = router;

