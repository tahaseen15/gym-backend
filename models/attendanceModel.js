let mongoose = require('mongoose')
Schema = mongoose.Schema;

let attendanceShema = new Schema({

    fullName:{
        type: String,
        required: [true, "name not provided"]
    },
    phone:{
        type: String,
        required: [true,"phone not provided"]
    },
    image:{
        type:String,
        // required:[true,"please provide image"]
    },
    memberShipStart:{
        type: Date,
        required:[true,"please provide the start date"]
    },
    memberShipEnd:{
        type: Date,
        required:[true,"please provide the end date"]
    },
    attendanceDate:{
        type: Date,
        required:[true,"please provide the today date"]
    },
    pack:{
        type: String,
        required:[true,"please provide the pack"]
    },
    memberShipNum:{
        type:String,
        required:[true,"please provide the number"]
    }


})

module.exports = mongoose.model('attendance',attendanceShema) 