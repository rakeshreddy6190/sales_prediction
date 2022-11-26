const express=require('express');
const mongoClient=require('mongodb').MongoClient;
const app=express()
const path = require('path')
const controller=require('./controller')
const bodyParser=require('body-parser');
const  exec  = require('child_process').exec;

app.use(express.static(path.join(__dirname,"../../dist/FP")));

app.use(bodyParser.json({
  limit:'52mb'
}));
app.use(bodyParser.urlencoded({
  extended: false
}));

//app.use('/api',controller)
app.post('/upload',(req,res,next)=>{  
      let dbo=app.locals.dbObject.db('FP');
      console.log("upload buhahaha")
      console.log("bu hahaha",req.body[0],req.body[1])
      
      
      dbo.collection('CSVS'+req.body[0]).insertMany(req.body[1],(err,success)=>{
            if(err){
                next(err)
            }
            res.send({message:"success"})
              
      })
})


app.post('/runMain',(req,res)=>{
  var spawn = require("child_process").spawn; 
  console.log("main buhahaha",req.body.name)
  // Parameters passed in spawn - 
  // 1. type_of_script 
  // 2. list containing Path of the script 
  //    and arguments for the script  
    
  // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will 
  // so, first name = Mike and last name = Will 
  var x=res
  exec("python main.py "+req.body.name,(err,stdout,stderr)=>{
        if(err){
            next(err)
        }
        console.log("stdout",stdout)
        console.log("stderr",stderr)
  })

  /*
  var process = spawn('python',["./main.py",req.body.name] ); 
  var da
  process.stdout.on('data', function(data) { 
        res.send(data.toString())
  }) 
  process.stdout.on('exit',()=>{
        res.send("end")
  }) */
})

app.post("/getResult",(req,res)=>{
  let dbo=app.locals.dbObject.db('FP');
  console.log("getResult buhahaha",req.body.name)
  dbo.collection("predictions"+req.body.name).find({}).toArray((err,obj)=>{
      if(err){
          next(err)
      }
      else{
          res.send({message:'success',data:obj})
      }
  })
})

app.use((req,res,next)=>{
  res.send({message:`${req.url} is invalid!`});
});

mongoClient.connect("mongodb+srv://Admin:Admin@cluster0-q4yrs.mongodb.net/FP/CSVS?retryWrites=true&w=majority",{useUnifiedTopology:true},(err,client)=>{
        if(!err){
                console.log("Conntected to Mongo !")
                const port =  3000;
                app.locals.dbObject=client;
                const server=app.listen(port,()=>{
                        console.log("server listening on "+port)
                })
                server.setTimeout(1200000)

        }
        else{
            console.log("error in connecting")
        }
})