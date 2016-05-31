module.exports = function (aData, socket, db, gUsers) {
  var user = prepUser(aData, socket), returnData = {};
  db.collection('users').insertOne(user, function(err, result) {
    if (err === null && result.insertedCount === 1) {
      user = result.ops[0];
      gUsers[user._id] = user;
      socket.emit('success', {
        success: 'signup',
        user: user,
        message: 'Welcome ' + user.username + ', Congratulations on signing up'
      });
    }
    else {
      socket.emit('failure', {
        failure: 'signUp',
        message: 'Username is already taken.'
      });
    }
 });
};
