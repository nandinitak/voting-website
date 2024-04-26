const express = require('express');//express is a web application framework for Node.js
const mongoose = require('mongoose');//mongoose is an ODM library for MongoDB and Node.js
const bodyParser = require('body-parser');//body-parser is a middleware to handle HTTP POST request in Express.js.


const app = express();
const PORT = 5000;
const cors=require('cors')  // middleware that allows API to accept cross-origin requests from the client
app.use(cors({origin:"*"})) //The {origin:"*"} option means that your server accepts cross-origin requests from any origin

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected')) //promises 
.catch(err => console.log(err));

// Create a schema for user data
const userSchema = new mongoose.Schema({ //Schema defines structure of the data, by specifying field name and types
  name: String,
  age: String,
  mobile: String,
  email: String,
  password: String,
  address: String,
  aadharCardNumber: String
});

const candidateSchema = new mongoose.Schema({
    name: String,
    party: String,
    age: Number,
    votes: Number,
    voteCount: Number,
  });
  
const Candidate = mongoose.model('candidates', candidateSchema); // Models--> constructors, represent documents that can be saved and retrieved from the database.



const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.json());

// Routes

//SIGNUP
app.post('/api/v1/users/signup', (req, res) => { //method used to set up a route that handles HTTP POST requests from client side.
  const userData = req.body;
  
  // Create a new user instance
  const newUser = new User(userData);
  
  // Save the user to the database
  newUser.save()
    .then(savedUser => {
      console.log('User saved:', savedUser);
      res.json({ success: true, message: 'Registration successful' });
    })
    .catch(error => {
      console.error('Error saving user:', error);
      res.status(500).json({ success: false, error: 'Registration failed' });
    });
});

// LOGIN 
app.post('/api/v1/users/login', async (req, res) => { //Async -->  to declare asynchronous function that returns a promise, function - error--> rejected, else resolved
    const { aadharCardNumber, password, role } = req.body;
  console.log(req.body)
    try {
      // Find user by aadharCardNumber and password
      const user = await User.findOne({ aadharCardNumber, password }); //awaits pauses the execution of async function, until it prints any result
  console.log(user)
  if(user.aadharCardNumber===aadharCardNumber)      return res.json({ success: true, token: 'your_generated_token_here' });

      else if (user==null) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
  
      // Check if role matches
      if (user.role !== role) {
        return res.status(401).json({ success: false, message: 'Invalid role' });
      }
  
      // If everything is okay, return token
      return res.json({ success: true, token: 'your_generated_token_here' });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ success: false, error: 'Login failed' });
    }
  });


  //LIST OF CANDIDATES
  app.get('/api/v1/candidates', async (req, res) => {
    try {
      const candidates = await Candidate.find({});
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  });      


  app.post('/api/v1/candidate/vote/:candidateId', async (req, res) => {
    try {
      const { candidateId } = req.params;
      const { token } = req.body;
  
      // Find the user by token
      const user = await User.findOne({ token });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Check if the user has already voted
      if (user.hasVoted) {
        return res.status(400).json({ success: false, message: 'You have already voted' });
      }
  
      // Find the candidate by ID
      const candidate = await Candidate.findById(candidateId);
  
      if (!candidate) {
        return res.status(404).json({ success: false, message: 'Candidate not found' });
      }
  console.log(candidate.votes);
      // Update the vote count
      candidate.votes += 1;
      await candidate.save();
  
      // Update user hasVoted status
      user.hasVoted = true;
      await user.save();
  
      res.json({ success: true, message: 'Vote successful' });
    } catch (error) {
      console.error('Error voting:', error);
      res.status(500).json({ success: false, error: 'Error voting' });
    }
  });
  
  app.get('/api/v1/candidate/candidates', async (req, res) => {
    try {
      const candidates = await Candidate.find({});
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  }); 
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
