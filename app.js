require('dotenv').config();
const express = require('express');
const colors = require('colors');
const userRoutes = require('./routers/user')
const app = express()
const port = 3000

const jwt = require('jsonwebtoken');


//DataBase connection
const mongoose = require('mongoose');
const { JsonWebTokenError } = require('jsonwebtoken');
mongoose.connect(process.env.URI , { useNewUrlParser : true, useUnifiedTopology : true})
.then((res)=>console.log('> Connected...'.bgCyan))
.catch(err=>console.log(`> Error while connecting to mongoDB : ${err.message}`.underline.red ))

//Server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

//Minddleware
app.use(express.json());
app.use('/', userRoutes)
app.use('/user',authenticateToken,  userRoutes)

function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) { 
            return res.sendStatus(401); 
        }
        if(data.userId !== req.body.userId) { 
            return res.sendStatus(401) 
        };
    })
    next();
}