const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
const { response } = require('express');

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log(`Connected to MongoDB😍😍😍 ... `) )
  .catch(() => console.log(`Could not Connect to MongoDB ... `) );

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



let exerciseSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: String
})
let userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  log: [exerciseSchema]
})

let User = mongoose.model("User", userSchema);
let Lift = mongoose.model("Lift", exerciseSchema);





app.post('/api/exercise/new-user', bodyParser.urlencoded({extended: false}), (req,res) => {
  let responseObject = {};
  responseObject["username"] = req.body.username;

  let newUser = new User({username: responseObject.username});
  newUser.save((err, data) => {
    if(err)return console.error(err);
    responseObject["_id"] = data.id;
    res.json(responseObject);
  }) 
})

app.get('/api/exercise/users', (req,res) => {
  User.find({}).select({username: 1, _id: 1}).exec((err,data) => {
    if(err)return console.log(err);
    res.json(data);
  })
})

app.post('/api/exercise/add',bodyParser.urlencoded({extended: false}), (req,res) => {
  let responseObject = {};
  responseObject["_id"] = req.body.userId;
  User.findById(req.body.userId, (err,data) => {
    if(err) return console.log(err);



    responseObject["username"] = data.username;
    let dateString = "";
    if(req.body.date === ""){
      dateString = new Date().toString();
    }else{
      dateString = new Date(req.body.date).toString();
    }
    dateString = dateString.split(' ').slice(0,4).join(' ');
    responseObject["date"] = dateString;
    responseObject["duration"] = parseInt(req.body.duration);
    responseObject["description"] = req.body.description;



    data.log.push({description: req.body.description, duration: parseInt(req.body.duration), date: responseObject.date.toString()});
    data.save();
    res.json(responseObject);
  }) 
})


app.get('/api/exercise/log', (req,res) => {
  User.findById(req.query.userId, (err,data) => {
    if(err)return console.error(err);
    let responseObject = {};
    console.log(data);
    responseObject['_id'] = data.id;
    responseObject['username'] = data.username;
    responseObject['count'] = data.log.length;
    responseObject['log'] = data.log.map(a => ({ description: a.description, duration: a.duration, date: a.date}));
    responseObject['count'] = data.log.length;

    res.json(responseObject)
  })
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
