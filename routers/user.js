const router = require('express').Router()
const userHandle = require('./Model/userModel')
const { registerValidation, postValidation } = require('./validation')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userPostHandle = require('./Model/userPostModel')


let refreshTokensRedis = [];

router.post('/token' , async (req , res)=> {
    const refreshToken = req.body.refreshToken;
    if(refreshToken == null) {
        return res.status(401).send();
    }
    if(!refreshTokensRedis.includes(refreshToken)) {
        return res.send(403).send("You are not authorised to access the resources")
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err){
            return res.status(403).send(err);
        }
        const accessToken =  generateAccessToken({ userId: user.userId });
        return res.json({accessToken : accessToken});
    })
})

router.post('/login' , async (req , res)=>{
    const { error } = registerValidation(req.body);
    if (error){
        return res.status(400).send(error.details[0].message);
    }   

    try {
        const user = await userHandle.findOne({ userId: req.body.userId });
        if (!user) {
            return res.status(400).send("userId or password is wrong");
        }

        // Password is Correct
        var validPass = await bcrypt.compare(req.body.password, user.password);        

        if(!validPass) {
            return res.status(400).send("Invalid password");
        }

        const userId = { userId : user.userId };
        const accessToken  = generateAccessToken(userId);
        const refreshToken  = jwt.sign(userId, process.env.REFRESH_TOKEN_SECRET);     
        refreshTokensRedis.push(refreshToken);
        res.json( {accessToken : accessToken, refreshtoken : refreshToken } );
    }
    catch (ex){
        res.status(400).send(ex);
    }

})

router.post('/register' , async (req , res)=>{

    // Validation before creation
    const { error } = registerValidation(req.body);
    if (error){
        return res.status(400).send(error.details[0].message);
    }    

    try {
        // Validation : is user already exist
        const userExist = await userHandle.findOne({ userId: req.body.userId });
        if (userExist) {
            return res.status(400).send("User Id already exist");
        }
        // Hashing password
        const salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(req.body.password, salt);        

        const user = new userHandle({
            userId : req.body.userId,
            password : hashedPassword
        })
        const response = await user.save();
        res.json(response)
    }
    catch (ex){
        res.status(400).send(ex);
    }
})


router.delete('/logout' , (req , res)=>{
    refreshTokensRedis = refreshTokensRedis.filter((token) => {
        token !== req.body.refreshToken;
    })
})


router.post('/post' , async (req , res)=>{

    //post validation
    const { error } = postValidation(req.body);
    if (error){
        return res.status(400).send(error.details[0].message);
    }   

    try {
        const userPost = new userPostHandle({
            userId : req.body.userId,
            post : req.body.post
        })
        const response = await userPost.save();
        res.json(response)
    }
    catch (ex){
        res.status(400).send(ex);
    }
})

router.get('/post' , async (req , res)=>{

    //post validation
    // const { error } = postValidation(req.body);
    // if (error){
    //     return res.status(400).send(error.details[0].message);
    // }   

    try {
        const userPost = new userPostHandle({
            userId : req.body.userId,
        })
        const response = await userPostHandle.find({ userId : req.body.userId });
        res.json(response)
    }
    catch (ex){
        res.status(400).send(ex);
    }
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '500s' })
  }

module.exports  = router