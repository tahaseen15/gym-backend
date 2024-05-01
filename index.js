    const express = require('express')
    const app = express()
    const mongoose = require('mongoose')
    const path = require("path")
    require('dotenv').config()

    const userRoutes = require('./routes/user.js')

    const cors = require('cors')
    app.use(cors())

    const userImagePath = path.join(__dirname,"./user_images/")
    app.use('/userimages', express.static(userImagePath));

    // try {
    //     mongoose.connect("mongodb://localhost:27017/gym");
    //     console.log("connected to db");
    // } catch (error) {
    //     console.log('unhandledRejection', error.message);   
    // }
    try {
        mongoose.connect(process.env.MONGODB_CONNECT_URI);
        console.log("connected to db");
    } catch (error) {
        console.log('unhandledRejection', error.message);   
    }

    app.use(express.json())
    app.use(express.urlencoded({
        extended: true
    }))


    app.use("/gym",userRoutes)

    app.listen(process.env.PORT || 8000,()=>{
        console.log("Server is live on port 8000")
    })