var
  // load utility things
  utils = require('./utils/basic')(),
  // get the client commands
  serverCommands = require('./serverCommands/main'),
  // serverCommands.utils = utils,
  port = process.env.PORT || 3000,
  gUsers = {},
  allClients = [],
  dbUrl = 'mongodb://localhost:27017/test',
  clearUserDB = false;
// connect to mongo database and create db object
MongoClient.connect(dbUrl, function (err, db) {
  // console.log('err', err);
  // shout about errors
  assert.equal(null, err);
  // clear user db
  if (clearUserDB) {
    // clear the db and remove indexs
    clearCollection('users', db);
    // create the unique index for users collection on username
    db.collection('users').createIndex({ username: 1 }, { unique: true });
  }
  // start listening on port
  http.listen(port, shoutPortNumber);
  // Routing for files and stuff
  app.use(express.static(__dirname + '/public'));
  // check when a user connects
  io.on('connection', function (socket) {
    // send "connected" event to the client
    socket.emit('connected');
    //socket to client list
    allClients.push(socket);
    // set loggedIn flag on socket when a client connects
    socket.loggedIn = false;
    // listen for 'command' event from user on socket
    socket.on('command', function (aData) {
      var command = serverCommands[aData.command];
      // check if we have the command
      if (command) {
        // run the client command
        command(aData.data, socket, db, gUsers);
      }
      else {
        console.log(__l + ': wtf', aData.command);
      }
    });
    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      // remove the client fromt he list
      allClients.splice(allClients.indexOf(socket), 1);
      if (gUsers[socket.userID]) {
        console.log('disconnect', socket.userID);
        // remove the user from global user list
        delete gUsers[socket.userID];
        // set the user to logged out in the db
        db.collection('users').update({
          _id: socket.userID}, {$set: {loggedIn: false}
        }, function () {
          // send updated user list to clients
          serverCommands.getUsers({disconnect: true}, socket, db, gUsers);
        });
      }
    });
  });
});
