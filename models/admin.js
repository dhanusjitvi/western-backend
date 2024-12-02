const mongoose = require('mongoose') 

const adminSchema = new  mongoose.Schema({
  
    email:{
        type: String,
        unique:true,
        require:true
    },
    password:{
        type:String,
        require:true
    }
})

module.exports = mongoose.model("Admin",adminSchema)