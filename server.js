'use strict';

const express = require('express');
const userCtrl = require('./server-sql/controllers/user-controller');
const actCtrl = require('./server-sql/controllers/act-controller');
const uaCtrl = require('./server-sql/controllers/ua-controller');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieController = require('./server-sql/controllers/cookieController');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

app.get('/user', userCtrl.getUser, userCtrl.conn); // to log in and get current user info
app.get('/userinfo/:id', userCtrl.profile, (req, res) => { res.end(); }); // to get a single user's profile with limited info'

app.get('/test', userCtrl.index); // full list of users, not needed for front-end - add in getUser back later
app.get('/fblogin', userCtrl.getToken, userCtrl.getClientId, cookieController.setCookie, function(req, res) {
  res.redirect('/#/profile');
});
app.get('/logout', function(req, res) {console.log(res)})

app.post('/user/add', userCtrl.add, (req, res) => { res.end(); });// to add a single user

app.get('/activities', actCtrl.index); // full list of activities, for user to choose from
app.post('/activity/add', actCtrl.add, uaCtrl.add, (req, res) => { res.sendStatus(200); });// to add a new activity 

app.get('/useractivities', uaCtrl.index, (req, res) => { res.end(); });// to view all joins between users & activities
app.post('/useractivity/add', uaCtrl.add, (req, res) => { res.end(); });// to add an existing activity TO a User
// app.put('/useractivity/close', uaCtrl.close, (req, res) => {res.end() }); // to mark activity as done

app.get('/useractivity/findbyact/:actname', uaCtrl.findbyact);// to find all users by activity

// returns data for graph
app.get('/graph', userCtrl.getAllUsers, actCtrl.getAllActivities, uaCtrl.getAllUserActivities, (req, res) => { 
  var output = {users: req.allUsers, buckets: req.allActivities, joins: req.allUserActivities};  
  //console.log('output', output);
  res.json(output); 
});

app.use(express.static(path.join(__dirname, '/client/')));

app.listen(3000, () => {
  console.log('listening on port 3000');
});
