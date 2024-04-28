const express = require('express')
const router = express.Router()
const {create_user,membershipaid,
    membershiunpaid,markAttendance,
    getTodayAttendance, getAllUsers, 
    deleteUser, getUserWithPhone, updateUser, getUserWithId, unsubcribePlan, deleteAttendance, getAttWithDate,
    signin,
    signup,
} = require("../controllers/user-controller")


// 

const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const multer = require("multer");
const config = require("../config/firebase.config.js");

initializeApp(config.firebaseConfig);
const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() });



const verifyToken = require("../middlewares/authJWT.js");
// const multer = require('multer')
// const storage = multer.memoryStorage();
// const upload = multer({storage:storage})




router.post("/create-user", verifyToken,upload.single("image"), create_user);
router.patch('/update-user/:userId',verifyToken,upload.single('image'),updateUser)
router.get('/getUser/:userId',verifyToken,getUserWithId)
router.get('/getUserWithPhone/:userId/:type',verifyToken,getUserWithPhone)
router.delete('/deleteUser/:userId',verifyToken,deleteUser)
router.get('/getAllUsers',verifyToken,getAllUsers)
router.post('/gym-attendance',verifyToken,markAttendance)
router.delete('/gym-attendance/:userId',verifyToken,deleteAttendance)
router.get('/membership-paid',verifyToken,membershipaid)
router.get('/membership-unpaid',verifyToken,membershiunpaid)
router.get('/get-today-attendance',verifyToken,getTodayAttendance)
router.delete('/unsubcribe/:userId',verifyToken,unsubcribePlan)
router.get('/gym-att-date/:date',verifyToken,getAttWithDate)
router.post('/login',signin)
router.post('/signup',signup)


module.exports = router