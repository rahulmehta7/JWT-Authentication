const mongoose = require('mongoose')    
const UserSchema = mongoose.Schema({
    userId : {
        type : String,
        required: true,
        min: 6,
        max: 255
    },
    post : {
        type : String,
        required: true,        
        min: 6,
        max: 1024
    },    
})
module.exports =  mongoose.model( 'UserPosts' , UserSchema)
