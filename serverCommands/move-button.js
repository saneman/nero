module.exports = function (aData, socket, db, gUsers) {
  var
    returnData = {},
    moves = {
      37: 'left',
      38: 'forward',
      39: 'right',
      40: 'back'
    },
    direction = moves[aData.keyNum];

  returnData = {
    success: 'moveButton',
    data: aData,
    direction: direction
  };

  returnData.message = 'a client has moved the button[' + direction + ']';
  returnData.notMe = true;
  socket.broadcast.emit('success', returnData);

  returnData.message = 'you have moved the button[' + direction + ']';
  returnData.notMe = false;
  socket.emit('success', returnData);
};
