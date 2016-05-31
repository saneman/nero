module.exports = function (aData, socket, db, gUsers) {
  var
    returnData = {},
    userID = aData.userID,
    findWhere = {_id: ObjectId(userID)},
    setData = {'buttonNum': aData.padNum};
  // update user set which button he is looking at
  db.collection('users').update(findWhere, {$set: setData}, function () {
      // vomitUser(userID);
      returnData = {
        success: 'takeControl',
        data: aData
      };

      returnData.message = 'a client has taken control of a button[' + aData.padNum + ']';
      returnData.notMe = true;
      socket.broadcast.emit('success', returnData);

      returnData.message = 'you has taken control of button[' + aData.padNum + ']';
      returnData.notMe = false;
      socket.emit('success', returnData);
    }
  );
};
