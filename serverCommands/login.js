module.exports = function (aData, socket, db, gUsers) {
  var
    user = aData,
    returnData = {},
    loggedInUser,
    findWhere,
    setData = {loggedIn: true};

  findWhere = aData._id !== undefined ? {
    "_id": ObjectId(aData._id)
  } : {
    password: md5(user.password),
    email: user.username
  };
  // db.collection(__l + ': users').findOne(findWhere, function (err, loggedInUser) {
  db.collection('users').findAndModify(
    findWhere, // query
    [],  // sort order
    {$set: setData}, // replacement, replaces only the field "hi"
    {}
  ).then(function (loggedInUser) {
    var user = loggedInUser.value, findWhere;
    // we have the user
    if (user) {
      findWhere = {_id: user._id};
      setData = {loggedIn: true};
      // update user in db to be "loggedIn"
      db.collection('users').update(findWhere, {$set: setData}, function () {
        console.log(__l + ': Welcome back ' + user.username);
        // set the user id on the socket
        socket.userID = user._id;
        // set the loggedIn flag on the users socket
        socket.loggedIn = true;
        // set socket id on user
        user.socketID = socket.id;
        //set the loggedIn flag on the user
        user.loggedIn = true;

        gUsers[user._id] = user;

        socket.emit('success', {
          success: 'login',
          user: user,
          isUser: true,
          users: gUsers,
          message: 'Welcome back: ' + user.username
        });

        socket.broadcast.emit('success', {
          success: 'login',
          isUser: false,
          user: user,
          users: gUsers,
          message: 'Welcome back: ' + user.username
        });
      });
    }
    else {
      socket.emit('failure', {
        failure: 'login',
        user: user,
        message: 'no user with those details exist'
      });
    }
  });
};
