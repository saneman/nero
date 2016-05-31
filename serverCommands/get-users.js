module.exports = function (aData, socket, db, gUsers) {
  var findWhere = {};
  db.collection('users').find(findWhere).each(function(err, user) {
    var returnData;
      assert.equal(err, null);
      if (user !== null) {
        gUsers[user._id] = user;
        returnData = {
          success: 'getUsers',
          message: 'loading user list',
          user: user,
          users: gUsers
        };
        socket.broadcast.emit('success', returnData);
        socket.emit('success', returnData);
      }
  });
};
