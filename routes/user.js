const express = require('express')
const router = express.Router()

const {create_user,membershipaid,
    membershiunpaid,markAttendance,
    getTodayAttendance, getAllUsers, 
    deleteUser, getUserWithPhone, updateUser, getUserWithId, unsubcribePlan, deleteAttendance, getAttWithDate,
} = require("../controllers/user-controller")

const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({storage:storage})


router.post('/create-user',upload.single('image'),create_user)
router.get('/getUser/:userId',getUserWithId)
router.get('/getUserWithPhone/:userId/:type',getUserWithPhone)
router.delete('/deleteUser/:userId',deleteUser)
router.patch('/update-user/:userId',upload.single('image'),updateUser)
router.get('/getAllUsers',getAllUsers)
router.post('/gym-attendance',markAttendance)
router.delete('/gym-attendance/:userId',deleteAttendance)
router.get('/membership-paid',membershipaid)
router.get('/membership-unpaid',membershiunpaid)
router.get('/get-today-attendance',getTodayAttendance)
router.delete('/unsubcribe/:userId',unsubcribePlan)
router.get('/gym-att-date/:date',getAttWithDate)


module.exports = router