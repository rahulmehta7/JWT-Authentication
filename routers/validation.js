const Joi = require('joi');

const registerValidation = (data) => {
    const registerSchema = Joi.object({
        userId: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    })    
    return registerSchema.validate(data);
}

const postValidation = (data) => {
    const postSchema = Joi.object({
        userId: Joi.string().min(6).required().email(),
        post: Joi.string().min(6).max(1024).required()
    })    
    return postSchema.validate(data);
}


module.exports.registerValidation = registerValidation
module.exports.postValidation = postValidation