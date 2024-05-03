let User = require('../models/userModel');
let Attendance = require('../models/attendanceModel')
const fs = require('fs');
var jwt = require("jsonwebtoken");
const argon2 = require('argon2');
const path = require('path');
const userImagePath = path.join(__dirname,"../user_images/")
const moment = require('moment');
const Admin = require('../models/adminModel');
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");
const { initializeApp } = require("firebase/app");
const config = require("../config/firebase.config.js");


initializeApp(config.firebaseConfig);
const storage = getStorage();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

exports.signin = async (req,res) => {
 
    try {
    
        const admin = await Admin.findOne({userName:req.body.userName});
        if(!admin) {
            return res.status(404)
                .send({
                    msg: "User not found."
                });
        }
        var passwordIsValid = await argon2.verify(admin.password, req.body.password)
 
        if (!passwordIsValid) {
            return res.status(401)
            .send({
                accessToken: null,
                msg: "Invalid Password" 
            });
 
        }

        var token = jwt.sign({
            id: admin.id
        }, process.env.API_SECRET, {
            expiresIn: 86400
        });
 
        res.status(200)
        .send({
            message: "Login successful",
            accessToken: token
        });
 
} catch (err) {
    console.log(err);
    res.status(500)
    .send({
        message: err
    });
    return;
    }
}

exports.signup = async (req,res) => {
    try{
        
        const secretKey = req.body.secretKey
        if(secretKey!==process.env.SECRET_KEY)
        {
            return res.status(500).send({msg: "wrong secretKey"});
        }
        const password = await argon2.hash(req.body.password)
        const admin = new Admin({
            userName: req.body.userName,
            password:password,
        });
 
        await admin.save();
        return res.status(200)
            .send({
                message: "User Registered Successfully"
            })
    } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.userName) {
            return res.status(400).send({msg: "Admin already exist" });
        }
        return res.status(500).send({type: "errmsg",msg:err});
                    
    }
};

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
};



exports.updateUser = async (req, res) => {
    try {

        
        const userId = req.params.userId; 

        const memberShipStart = req.body.memberShipStart;
        const pack = req.body.pack;
        const memberShipEnd = moment(memberShipStart).add(pack, 'months').toDate();
        const memberShipNum = req.body.memberShipNum;
        let updatedUser = null

        if(req.file)
        {
            const fileSize = req.file.size;
            const maxSize = 1024 * 1024; // 1MB in bytes
            const minSize = 50 * 1024; // 50KB in bytes
            if (fileSize > maxSize) {
                return res.status(400).send({ type: 'eImage', msg: "Image size should be less than 1MB" });
            } else if (fileSize < minSize) {
                return res.status(400).send({ type: 'eImage', msg: "Image size should be at least 50KB" });
            }
            const dateTime = giveCurrentDateTime();
            const storageRef = ref(storage, `files/${req.file.originalname + "       " + dateTime}`);
            const metadata = {
                contentType: req.file.mimetype,
            };
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
            const downloadURL = await getDownloadURL(snapshot.ref);

            updatedUser = await User.findByIdAndUpdate(userId, {
                $set: {
                    fullName: req.body.fullName,
                    phone: req.body.phone,
                    memberShipStart: memberShipStart,
                    memberShipEnd: memberShipEnd,
                    memberShipNum,
                    image: downloadURL,
                    pack: req.body.pack
                }
            }, { new: true });
    

        }
        else 
        {
            updatedUser = await User.findByIdAndUpdate(userId, {
                $set: {
                    fullName: req.body.fullName,
                    phone: req.body.phone,
                    memberShipStart: memberShipStart,
                    memberShipEnd: memberShipEnd,
                    memberShipNum,
                    pack: req.body.pack
                }
            }, { new: true });
    
        }
        
        if (!updatedUser) {
            return res.status(404).send({ type: "error", msg: "User not found" });
        }

        return res.status(200).send({ type: "success", msg: "User updated successfully", user: updatedUser });
    } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.phone) {
            return res.status(400).send({ type: "ePhone", msg: "Phone number already exists" });
        } else if (err.code === 11000 && err.keyPattern && err.keyPattern.memberShipNum) {
            return res.status(400).send({ type: "eNum", msg: "Membership number already exists" });
        } else {
            console.log(err);
            return res.status(500).send({ type: "errmsg", msg: err });
        }
    }
}



exports.create_user = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ type: 'eImage', msg: "Image should be uploaded" });
        }
        const fileSize = req.file.size;
        const maxSize = 1024 * 1024; // 1MB in bytes
        const minSize = 50 * 1024; // 50KB in bytes
        if (fileSize > maxSize) {
            return res.status(400).send({ type: 'eImage', msg: "Image size should be less than 1MB" });
        } else if (fileSize < minSize) {
            return res.status(400).send({ type: 'eImage', msg: "Image size should be at least 50KB" });
        }
        const dateTime = giveCurrentDateTime();
        const storageRef = ref(storage, `files/${req.file.originalname + "       " + dateTime}`);
        const metadata = {
            contentType: req.file.mimetype,
        };
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const memberShipStart = req.body.memberShipStart;
        const pack = req.body.pack;
        const memberShipEnd = moment(memberShipStart).add(pack, 'months').toDate();
        const memberShipNum = req.body.memberShipNum;

        const user = new User({
            fullName: req.body.fullName,
            phone: req.body.phone,
            memberShipStart: memberShipStart,
            memberShipEnd: memberShipEnd,
            image: downloadURL,
            pack: pack,
            memberShipNum
        });

        await user.save();

        return res.status(201).send({ type: "success", msg: "User created successfully" });
    } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.phone) {
            return res.status(400).send({ type: "ePhone", msg: "Phone number already exists" });
        } else if (err.code === 11000 && err.keyPattern && err.keyPattern.memberShipNum) {
            return res.status(400).send({ type: "eNum", msg: "Membership number already exists" });
        } else {
            console.log(err);
            return res.status(500).send({ type: "errmsg", msg: err });
        }
    }
};


exports.getUserWithId = async (req, res) => {
    try {
        let userId = req.params.userId;        
        let data = await User.findOne({ _id: userId })
        
        let formattedMemberShipStart = moment(data.memberShipStart).format('YYYY-MM-DD');
        let formattedMemberShipEnd = moment(data.memberShipEnd).format('YYYY-MM-DD');
        let userDetails = {
            fullName : data.fullName,
            memberShipStart: formattedMemberShipStart,
            memberShipEnd: formattedMemberShipEnd,
            image: data.image,
            phone: data.phone,
            _id: data._id,
            pack: data.pack,
            memberShipNum: data.memberShipNum
        }

        return res.status(200).send({ userDetails});
    } catch (err) {
        return res.status(500).send({ type: "errmsg", msg:"such user not exist" });
    }
}

exports.getAllUsers = async(req,res)=>{

    try{
        let allUsers = await User.find().sort({memberShipNum: -1 }).lean()
        allUsers = allUsers.map(user => {
            return {
                ...user,
                memberShipStart:  user.memberShipStart.toISOString().split('T')[0],
                memberShipEnd:  user.memberShipEnd.toISOString().split('T')[0],
            };
        })
        return res.status(200).send({allUsers:allUsers})
    }
    catch(err)
    {
        return res.status(500).send({type: "errmsg",msg: "something went wrong"});
    }
}

exports.deleteUser = async(req,res)=>{
    try{
        let userId = req.params.userId
        let deleteRes = await User.findByIdAndDelete(userId);
        return res.status(200).send(deleteRes)
    }
    catch(err)
    {
        return res.status(400).send(err)
    }
}

exports.getUserWithPhone = async(req,res)=>{
    try{

        let today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let phoneNo = req.params.userId
        if(phoneNo.length !=10)
            return res.status(400).send({type: "ePhone",  msg: "Number should have 10 digits" });

        let type = req.params.type;
        let userDetails = {}

        if(type==='paid')
        {
            userDetails = await User.findOne({
                memberShipEnd: { $gte: today },
                phone: phoneNo
            }).lean();
            
            if (userDetails) {
                userDetails.memberShipEnd = userDetails.memberShipEnd.toISOString().split('T')[0];
                userDetails.memberShipStart = userDetails.memberShipStart.toISOString().split('T')[0];

            }
        }
        else if(type==='unpaid')
        {
            
            userDetails = await  User.findOne({
                memberShipEnd: { $lt: today },
                phone: phoneNo
            }).lean();
            
            if (userDetails) {
                userDetails.memberShipEnd = userDetails.memberShipEnd.toISOString().split('T')[0];
                userDetails.memberShipStart = userDetails.memberShipStart.toISOString().split('T')[0];

            }
        }
        else if(type==='all')
        {
            userDetails = await User.findOne({ phone: phoneNo }).lean();
            
            if (userDetails) {
                userDetails.memberShipEnd = userDetails.memberShipEnd.toISOString().split('T')[0];
                userDetails.memberShipStart = userDetails.memberShipStart.toISOString().split('T')[0];
            }

        }
        else return res.status(500).send({type: "errmsg", msg: err?.message || "something went wrong "});

        if (!userDetails) {
            return res.status(400).send({ type: "ePhone", msg: "User not found"});
        }

        return res.status(200).send({userDetails})
    }
    catch(err)
    {
        return res.status(500).send({type: "errmsg", msg: err?.message || "something went wrong "});
    }
}



exports.markAttendance = async (req,res)=>{
    try{
        let phoneNo = req.body.phone
        if(phoneNo.length !=10)
            return res.status(400).send({type: "ePhone",  msg: "Number should have 10 digits" });

        
        const existingUser = await User.findOne({ phone: phoneNo });
        if (!existingUser) {
            return res.status(400).send({ type: "ePhone", msg: "Phone no not found" });
        }

        let today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let date = moment().format()
        let currDate = date.toString().split('T')[0] + 'T00:00:00.000+00:00'

        const attn = await Attendance.findOne({ 
            $and:[
                {phone: phoneNo},
                { attendanceDate: { $gte: currDate } }
            ]
        
        });

        if(attn)
            return res.status(400).send({type: "ePhone",  msg: "Attendance already taken" });
        
        let localTime = moment().utcOffset('+05:30').format();
        localTime = localTime.toString().split('+')[0] + '.000+00:00' //give local time exactly
        console.log(localTime)
        let attendance = new Attendance({
            fullName: existingUser.fullName,
            phone: existingUser.phone,
            image: existingUser.image,
            memberShipStart: existingUser.memberShipStart,
            memberShipEnd: existingUser.memberShipEnd,
            pack: existingUser.pack,
            attendanceDate:localTime,
            memberShipNum: existingUser.memberShipNum
        })
        const attnData = await attendance.save()
        return res.status(200).send({ attnData});
    }
    catch (err) {
        
            return res.status(500).send({type: "errmsg", msg: err?.message || "something went wrong "});

    }
}

exports.getTodayAttendance = async (req,res)=>{
    try{
        
        let date = moment().format()
        let startDate = date.toString().split('T')[0] + 'T00:00:00.000+00:00'
        let endDate =  date.toString().split('T')[0] + 'T23:59:59.999+00:00'
        let users = await Attendance.find({
            $and: [
                { attendanceDate: { $gte: startDate } },
                { attendanceDate: { $lte: endDate } }
            ]
        }).sort({ attendanceDate: -1 });

        let today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        users = users.map(user => {

            let paid = true
            if(today>user.memberShipEnd)
                paid=false
            return {
                ...user._doc,
                paid,
                attendanceDate: user.attendanceDate.toISOString().split('T')[0],
                memberShipStart: user.memberShipStart.toISOString().split('T')[0],
                memberShipEnd: user.memberShipEnd.toISOString().split('T')[0],
                EntryTime: user.attendanceDate .toISOString().split('T')[1].split('.')[0],
            };
        });

        return res.status(200).send({users:users})
    }
    catch(err){
        console.log(err)
        return res.status(400).send("something went wrong")
    }
}


exports.deleteAttendance = async(req,res)=>{
    try{
        let userId = req.params.userId
        let deleteRes = await Attendance.findByIdAndDelete(userId);
        return res.status(200).send(deleteRes)
    }
    catch(err)
    {
        return res.status(400).send(err.message)
    }

}

exports.getAttWithDate = async (req,res)=>{

    try{
        let date = req.params.date
        let startDate = date+'T00:00:00.000+00:00'
        let endDate = date+'T23:59:59.999+00:00'
        
        let users = await Attendance.find({
            $and: [
                { attendanceDate: { $gte: startDate } },
                { attendanceDate: { $lte: endDate } }
            ]
        }).sort({ attendanceDate: -1 });
        users = users.map(user => {
            return {
                ...user._doc,
                attendanceDate: user.attendanceDate .toISOString().split('T')[0],
                memberShipStart: user.memberShipStart.toISOString().split('T')[0],
                memberShipEnd: user.memberShipEnd.toISOString().split('T')[0],
                EntryTime: user.attendanceDate .toISOString().split('T')[1].split('.')[0],
            };
        });
        return res.status(200).send({users:users})
    }
    catch(err){
        return res.status(400).send({msg: "something went wrong"})
    }
}

exports.membershiunpaid = async (req,res)=>{

    try{
        let today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        let users = await User.find({
            memberShipEnd: { $lt: today }
        }).sort({ memberShipEnd: -1 });

        users = users.map(user => {
            return {
                ...user._doc,
                memberShipStart:  moment(user.memberShipStart).format('YYYY-MM-DD'),
                memberShipEnd:  moment(user.memberShipEnd).format('YYYY-MM-DD'),
            };
        });
        
        return res.status(201).send({users})        
    }
    catch(err)
    {
        return res.status(500).send({type: "errmsg", msg: err?.message || "something went wrong "});      
    }
}

exports.membershipaid = async (req,res)=>{

    try{
        let today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        let users = await User.find({
            memberShipEnd: { $gte: today }
        }).sort({ memberShipEnd: -1 });

        users = users.map(user => {
            return {
                ...user._doc,
                memberShipStart:  moment(user.memberShipStart).format('YYYY-MM-DD'),
                memberShipEnd:  moment(user.memberShipEnd).format('YYYY-MM-DD'),
            };
        });
        
        return res.status(201).send({users})
    }
    catch(err)
    {
        return res.status(500).send({type: "errmsg", msg: err?.message || "something went wrong "});       
    }
}

exports.unsubcribePlan = async (req, res) => {
    try {
        const userId = req.params.userId;
        let userDetails = await User.findOne({ _id: userId });

        if (userDetails == null)
            return res.status(500).send({ type: "errmsg", msg: "Wrong id" });


        // Calculate yesterday's date
        const yesterday = moment().subtract(1, 'day').toDate();

        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                fullName: userDetails.fullName,
                image: userDetails.image,
                phone: userDetails.phone,
                memberShipStart: userDetails.memberShipStart,
                memberShipEnd: yesterday, // Update membershipEnd to yesterday
                pack: 0
            }
        }, { new: true });

        return res.status(200).send({ updatedUser });
    } catch (err) {
        return res.status(400).send(err.message);
    }
}



