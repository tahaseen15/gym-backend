let mongoose = require('mongoose')
Schema = mongoose.Schema;

let userShema = new Schema({
    fullName:{
        type: String,
        required: [true, "name not provided"]
    },
    phone:{
        type: String,
        unique: [true, "user already exist with this phone number"],
        required: [true,"phone not provided"]
    },
    image:{
        type:String,
        required:[true,"please provide image"]
    },
    memberShipStart:{
        type: Date,
        required:[true,"please provide the start date"]
    },
    memberShipEnd:{
        type: Date,
        required:[true,"please provide the end date"]
    },
    pack:{
        type: String,
        required:[true,"please provide the pack"]
    },
    memberShipNum:{
        type: String,
        unique: [true, "This membership number already exists"],
        required: [true,"please provide the membership number"]
    }

})

module.exports = mongoose.model('users',userShema)