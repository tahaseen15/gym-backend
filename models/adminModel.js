var mongoose = require('mongoose'),
Schema = mongoose.Schema;
 
var adminSchema = new Schema({
    userName: {
        type: String,
        unique: [true, "admin already exists"],
        required: [true, "userName not provided"]
    },
    password: {
        type: String,
        required: true,
    },
});
 
module.exports = mongoose.model('admin', adminSchema);