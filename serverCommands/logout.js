module.exports = function (aData, socket, db, gUsers) {
  var
    returnData = {},
    userID = aData.userID,
    searchBy;

  if (userID && userID.toString() === socket.userID.toString()) {
    searchBy = {
      _id: ObjectId(userID)
    };
    // update "loggedIn" flag on user in DB
    db.collection('users').update(searchBy, {
      $set: {loggedIn: false}
    }, function () {
      // set flag on user in global list
      gUsers[userID].loggedIn = false;
      // flag on socket to be logged out
      socket.loggedIn = false;
      returnData = {
        success: 'logout',
        message: 'user: ' + userID + ' has logged out',
        userID: userID,
        users: gUsers
      };
      console.log('logging out success');
      // tell everyone ELSE a user has logged out
      socket.broadcast.emit('success', returnData);
      // tell user he has successfully logged out
      socket.emit('success', returnData);
    });
  }
  else {
    console.log('logging out failure');
    returnData = {
      failure: 'logout',
      message: 'failed to log out',
      userID: userID
    };
    socket.emit('failure', returnData);
  }
};
