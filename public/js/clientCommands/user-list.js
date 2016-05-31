define([
  'namespace',
  'jscookie',
  'handlebars'
],

function (namespace, Cookies, handlebars) {

  "use strict";

  var
    globals = namespace,
    gUser = globals.gUser,
    gUsers = globals.gUsers,
    gTemplates = globals.gTemplates,
    socket = globals.socket;

  // add success and failure to the global command list for callbacks
  globals.getUsers = {
    main: function (aUserSearch) {
      socket.emit('command', {
        command: 'getUsers',
        data: aUserSearch
      });
    },
    success: function (aData) {
      var
        users = aData.users,
        gUser = globals.gUser,
        template = handlebars.compile(gTemplates['user-list']);

      gUsers = users;
      gUsers[gUser._id].isUser = true;

      if (gUsers[gUser._id].loggedIn) {
        $('.user-list').html(template({
          users: gUsers,
          user: gUser
        })).show();

        $('.logout-button').off().on('click', function () {
          // load the 'login module'
          require(['logout'], function () {
            globals.logout.main();
          });
        });
      }
    },
    failure: function (aData) {
      globals.showAlert('warning', aData.message);
    },
    render: function () {
      // console.log('user-list render');
      globals.getUsers.main();
    }
  };
});
