module.exports = function (aData, socket, db, gUsers) {
  var
    returnData = {
      success: 'chess',
      message: 'Your opponent has made a move',
      data: aData
    };


  db.collection('chessMoves').insertOne(aData.move, function(err, result) {
    if (err === null && result.insertedCount === 1) {
      console.log(__l + ': ', aData.move);

      socket.broadcast.emit('success', returnData);
      // socket.emit('success', returnData);
    }
    else {
      socket.emit('failure', {
        failure: 'chess',
        message: 'something broke db insert'
      });
    }
  });
};
