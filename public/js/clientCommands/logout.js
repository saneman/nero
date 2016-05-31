define([
  'namespace',
  'jscookie',
  'handlebars'
],

function (namespace, Cookies, handlebars) {

  'use strict';

  var
    globals = namespace,
    gUser = globals.gUser,
    gUsers = globals.gUsers,
    socket = globals.socket;

  // add success and failure to the global command list for callbacks
  globals.logout = {
    main: function (aElement) {
      socket.emit('command', {
        command: 'logout',
        data: {
          userID: globals.gUser._id
        }
      });
    },
    success: function (aData) {
      var
        // get ID of user logging out
        userLoggingOutID = aData.userID,
        // get ID of current user
        userID = gUser._id,
        // get userlist element of the user logging out
        $user = $('.user-item[user-id="' + userLoggingOutID + '"]');
      // check of user loggin out is the current user
      if (userID === userLoggingOutID) {
        // set flag on this user as they are the ones logging out
        gUser.loggedIn = false;
        // delete the user cookie
        Cookies.remove('appUser');
        // render the 'login module'
        globals.login.render();
        globals.getUsers.main();
      }
      else {
        // console.log('its ->>NOT<<- me logging out', this.gUser);
        $user.effect('pulsate', {times: 1}, 500);
        globals.getUsers.main();
      }
    },
    failure: function (aData) {
      globals.showAlert('warning', aData.message);
    },
    render: function () {
    }
  };
});
