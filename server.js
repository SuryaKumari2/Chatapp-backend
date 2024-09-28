const express =require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const Registeruser=require('./models/userModel')
const middleware=require('./middleware')
const cors=require('cors')
const jwt = require('jsonwebtoken');
const Msgmodel=require('./models/msgModel')
dotenv.config();
mongoose.connect(process.env.MONGO_URL).then(()=>console.log('db connected')).catch((error)=>console.log(error))
 const app=express();
 const PORT=5005;
 app.use(express.json());
app.use(cors({origin:"*"}))


//Register
app.post('/register',async(req,res)=>{
    try{
        const{username,email,password,confirmPassword}=req.body;
        let exist=await Registeruser.findOne({email})
        if(exist){
            return res.status(400).send('already user exist');
        }
        if(password!==confirmPassword){
            return res.status(400).send('passwords are not matching');
        }
        let newUser= new Registeruser({
            username,email,password,confirmPassword
        })
        await newUser.save();
        res.status(200).send('Registeration successfull');
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Internal server issues');
    }
})


//Login


 
app.post('/login',async(req,res)=>{
    try{
        const{email,password}=req.body;
        let exist=await Registeruser.findOne({email})
        if(!exist){
            return res.status(400).send('user not found');
        }
        if(exist.password!==password){
            return res.status(400).send('Invalid password');
        }
        let payload={
            user:{
                id:exist.id
            }
        }
        
        jwt.sign(payload,'jwtSecurity',{expiresIn:360000},(err,token)=>{
                if (err) throw err;
                return res.json({token});
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).send('server issues');
    }
})

//
app.get('/myprofile',middleware,async(req,res)=>{
    try{

        let exist =await Registeruser.findById(req.user.id)
        if(!exist)
            {
                return res.status(400).send('user not found');
            }
            res.json(exist);
    }
    catch(error){
        console.log(error);
        return res.status(500).send('server issues');
    }
})
  app.listen(PORT,()=>{
    console.log(`server running ${PORT}`)
  })




  app.post('/addmsg',middleware,async(req,res)=>{
    try{
        const {text}=req.body;
        let exist =await Registeruser.findById(req.user.id)
        let newmsg=new Msgmodel({
            user:req.user.id,
            username:exist.username,
            text
        })
        await newmsg.save();
        let allmsg=await Msgmodel.find();
        return res.json(allmsg)
        
    }
    catch(error){
        console.log(error);
        return res.status(500).send('server error')
    }
  })



  app.get('/getmsg',middleware,async(req,res)=>{
    try{

        let allmsg=await Msgmodel.find();
        return res.json(allmsg)
        
    }
    catch(error){
        console.log(error);
        return res.status(500).send('server error')
    }
  })

  app.use((req,res)=>{
    res.send('');
  })