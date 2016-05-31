module.exports = function (aData, socket, db, gUsers) {
  var
    returnData = {
      success: 'chess',
      message: 'Your oppnent has made a move',
      data: aData
    };
  console.log(__l + ': ', aData);
  socket.broadcast.emit('success', returnData);
  // socket.emit('success', returnData);
};
