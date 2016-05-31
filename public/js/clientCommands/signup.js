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
    main: function () {
      socket.emit('command', {
        command: 'signup',
        data: {
          username: $('.username').val(),
          password: $('.password').val()
        }
      });
    },
    success: function (aData) {
      var
        user = aData.user;
      globals.login.main(user);
    },
    failure: function (aData) {
      console.log('sign up failure');
      globals.showAlert('warning', aData.message);
    },
    render: function () {
      $('.sign-up-button').off().on('click', globals.signup.main);
    }
  };
});
