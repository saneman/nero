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
    socket = globals.socket,
    idiotCnt = 0,
    app = 'nero';
  // add success and failure to the global command loist for callbacks
  globals.login = {
    // main action of the module
    main: function (aData) {
      socket.emit('command', {
        command: 'login',
        data: aData._id !== undefined ? {
          _id: aData._id
        } : {
          username: $('.username').val(),
          password: $('.password').val()
        }
      });
    },
    success: function (aData) {
      var
        isUser = aData.isUser,
        user = aData.user,
        users = aData.users,
        message = aData.message,
        inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000),
        appUser = Cookies.getJSON('appUser');
      // if we find the user wit those details
      if (isUser) {
        // set global user
        globals.gUser = user;
        globals.showAlert('success', message);
        // remove the login form
        $('.login').remove();
        // reduce main app width to accomodate user list
        $('.main').addClass('main-app');
        // set cookie so user can refresh browser
        Cookies.set('appUser', {_id: user._id}, {expires: inFifteenMinutes});
        // load an app
        require([app], function () {
          globals[app].render();
        });
        // load user list
        require(['user-list'], function () {
          globals.getUsers.render();
        });
      }
    },
    failure: function (aData) {
      var appUser = Cookies.getJSON('appUser');
      if (appUser !== undefined) {
        Cookies.remove('appUser');
        appUser = undefined;
        globals.login.render();
      }
      // console.log('login failure: ', aData);
      if (idiotCnt < 3) {
        globals.showAlert('warning', aData.message);
      }
      else {
        globals.showAlert('danger', 'Don\'t be a twat');
        idiotCnt = 0;
      }
      idiotCnt++;
    },
    render: function () {
      var appUser = Cookies.getJSON('appUser');
      // check if user has cookie set
      if (appUser !== undefined) {
        // run login command
        this.main({
          _id: appUser._id
        });
      }
      else {
        $('.main').removeClass('main-app');
        // if login fails clear user list and hide it just becos
        $('.user-list').html('').hide();
        // insert handlebars template in to app container
        $('.main').html(template);
        // listen for the click even on the "login button" and run "main"
        $('.login-button').off().on('click', globals.login.main);
        // listen for a click event on the "sign up button"
        require(['signup'], function () {
          globals.signup.render();
        });
      }
    }
  };
});
