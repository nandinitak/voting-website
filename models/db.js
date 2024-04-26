const mongoose=require('mongoose');
const MONGODB_URL_LOCAL=process.env.MONGODB_URL_LOCAL || "mongodb://127.0.0.1:27017/voting"
const mongoUrl = MONGODB_URL_LOCAL;
mongoose.connect(mongoUrl,{
  useNewUrlParser:true,
  useUnifiedTopology:true
})

const db= mongoose.connection;
db.on('connected',()=>{
  console.log("MongoDB connected");
})
db.on('error',(err)=>{
  console.log("MongoDB connection error"+err);
})

db.on('disconnected',()=>{
  console.log("MongoDB connected");
})


module.exports=db;