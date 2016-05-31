define([
  'namespace',
  'jscookie',
  'handlebars',
  'bootstrap'
],

function (namespace, Cookies, handlebars) {

  "use strict";

  var
    globals = namespace,
    gTemplates = globals.gTemplates,
    template = handlebars.compile(gTemplates.login)(),
    socket = globals.socket;

  globals.signup = {
    main: function (aData) {
      // send server an event with the socket
      socket.emit('command', {
        command: 'command to send to server',
        data: {
          the: 'data payload to the server'
        }
      });
    },
    success: function (aData) {
      // stuff to happen if command to server is succesful
    },
    failure: function (aData) {
      // stuff to do if command fails
    },
    render: function (aData) {
      // a function called render
    }
  };
});
