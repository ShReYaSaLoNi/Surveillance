// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors=require('cors')
const app = express();
const port = 3000;
const Workerdrone=require('./model/WorkerModel.model')
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
app.use(cors())
app.use(express.json())
app.use(bodyParser.json());
// Connect to MongoDB
mongoose.connect('mongodb+srv://Syndrone:sihwinner@cluster0.vqmvuyx.mongodb.net/?retryWrites=true&w=majority').then(()=>{
    console.log('MongoDB Connected')
}
).catch(err=>console.log(err));

// Define a schema and model for location data
const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  timestamp: Date,
});

const Location = mongoose.model('Location', locationSchema);


 
// Create an API endpoint to retrieve the latest location data
app.get('/api/location', async (req, res) => {
  try {
    const latestLocation = await Location.findOne().sort({ timestamp: -1 });
    //console.log(latestLocation)
    res.json(latestLocation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Storing location sent by server drone seperately

const lat = latestLocation.latitude;
const lon = latestLocation.longitude;

//WorkerDrone Manual Wala

app.post('/workerdrone/register', async(req, res) => {
 
  const {warehouseid,password}=req.body
  console.log(req.body)

  try{
    const existingWorker = await Workerdrone.findOne({ warehouseid,password });

    if (existingWorker) {
      return res.status(400).json({ message: 'Worker already exists' });
    }
    //const hashedPassword = await bcrypt.hash(password, 10);
    const worker= await Workerdrone.create({
        lattitude: req.body.lattitude,
        longitude: req.body.longitude,
        warehouseId:req.body.warehouseid,
        warehouseName:req.body.warehousename,
        password: req.body.password,
        flag:0,
        
    })
    res.json({status: 'ok'})
}
catch(err){
  console.log(err)
    res.json({status: 'error'})
}
});


app.post('/workerdrone/login', async (req, res) => {
  //console.log(req.body);

  try {
    const worker = await Workerdrone.findOne({
      warehouseId: req.body.warehouseid,
    });
   // console.log(worker)

    if (!worker) {
      console.log('User not found');
      return res.json({ status: 'not ok' });
    }
    
    
      console.log('User found');
      //console.log(worker)
     if(worker.password==req.body.password){
      const token = jwt.sign(
        {
          _id: worker._id,
          
        },
        'secret123'
      );

      return res.json({ status: 'ok', worker: token });
      
     }else{
      return res.json({ status: 'not ok' });
     }
    
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
});

app.put('/workerdrone/update', verifyToken,async(req,res)=>{
    const {_id}=req.user;
    console.log(_id)
    try {
      // const currentWorker=await Workerdrone.findOne({_id})
      await Workerdrone.updateOne({ _id }, { $set: { flag: 1 } });

      res.json({ status: 'ok' });
    } catch (error) {
      console.error('An error occurred:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
   
})

 function verifyToken(req, res, next){
  const token = req.header('Authorization'); // Get the token from the request header
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, 'secret123'); // Replace with your actual secret key
    req.user = decoded;
    next(); // Proceed to the next middleware/route
  } catch (error) {
    res.status(400).send('Invalid token.');
  }
};

app.get('/alldrones',async (req,res)=>{
  try
  {
     const Drones = await Workerdrone.find(
     {location:
      { $near :
         {
           $geometry: { type: "Point",  coordinates: [ lat, lon ] },
           $minDistance: 100,
           $maxDistance: 5000
         }
       }
      })
     res.json(Drones);
    } catch (error) {
      console.error('An error occurred:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
})


/*

app.get('/alldrones', async(req,res)=>{
  try{
    const Drones = await Workerdrone.find({});
    res.json(Drones);
  }
  catch(error){
    console.error('An error occurred:', error);
    res.status(500).json({status: 'error', message: 'Internal Server Error'})
  }
})
*/

app.get('/droneStatus/:id', async(req,res)=>{
  const id = new mongoDB.ObjectID(id);
  try{
    const droneId = await Workerdrone.findOne({
      _id : id,
    });
    res.json(droneId);
  }
  catch(error){
    console.error('An error occurred:', error);
    res.status(500).json({status: 'error', message: 'Internal Server Error'})
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
