module.exports = function (aData, socket, db, gUsers) {
  var
    returnData = {
      success: 'padClick',
      message: 'a client clicked a button[' + aData.padNum + ']',
      data: aData
    };
  socket.broadcast.emit('success', returnData);
  socket.emit('success', returnData);
};
