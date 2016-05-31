$(function () {

  "use strict";

  var
    connected = false,
    gAlertTime = 4000,
    gTemplates = {},
    // make a socket connection
    socket = io(),
    alertCnt = 1,
    gUsers = {},
    gUser = {},
    $app = $('.app'),

    collision = function ($div1, $div2) {
      var x1 = $div1.offset().left;
      var y1 = $div1.offset().top;
      var h1 = $div1.outerHeight(true);
      var w1 = $div1.outerWidth(true);
      var b1 = y1 + h1;
      var r1 = x1 + w1;
      var x2 = $div2.offset().left;
      var y2 = $div2.offset().top;
      var h2 = $div2.outerHeight(true);
      var w2 = $div2.outerWidth(true);
      var b2 = y2 + h2;
      var r2 = x2 + w2;

      if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
      return true;
    },

    displayUsers = function (aUser) {
      var
        // user = aData.user,
        isUser = aUser._id === gUser._id,
        template = Handlebars.compile(gTemplates['user-list']),
        html;

      aUser.active = isUser ? 'active' : undefined;
      html = template({users: gUsers});
      $('.user-list').html(html);
      $('.logout-button').off().on('click', commands.logout.main);


      $( '#slider' ).slider({
        value: 100,
        min: 0,
        max: 500,
        step: 50,
        slide: function( event, ui ) {
          $( "#amount" ).val( "$" + ui.value );
        }
      });






      console.log('slider?', $('#ex1').length);
    },

    loadLogin = function () {
      $app.html(gTemplates.login);
      $('.login-button').off().on('click', commands.login.main);
      $('.sign-up-button').off().on('click', commands.signUp.main);

      $('.slider').slider({
      	formatter: function(value) {
      		return 'Current value: ' + value;
      	}
      });

    },

    loadApp = function (aApp) {
      $app.html(gTemplates[aApp]);

      // padClick basic

      // whichApp

      // $('.pad-button').off().on('click', commands.padClick.main);

      $('.pad-button').off().on('click', commands.takeControl.main);

      // load user list
      commands.getUsers.main();


    },

    loadTemplates = function (aTemplates) {
      var tKey;
      for (tKey in aTemplates) {
        gTemplates[tKey] = aTemplates[tKey];
      }
    },

    showAlert = function (aType, aMessage) {
      var
        template = Handlebars.compile(gTemplates.alert),
        alertID = 'alert' + alertCnt,
        current = $('.main-alert'),
        html = template({
          id: alertID,
          class: aType,
          message: aMessage,
          top: current.length ? ($('.main-alert')[0].attributes[1] + 10) : 0
        });
      $('.alert-box').append(html);
      $('#' + alertID).fadeOut(gAlertTime, 'swing', function () {
        $(this).remove();
      });
      alertCnt++;
    },

    highLight = function (aElement, b) {
      // console.log('highLight', aElement, b);
      $(aElement.target).addClass('active');
    },

    commands = {
      padClick: {
        main: function (aElement) {
          var padNum = $(aElement.target).attr('num');
          socket.emit('command', {
            command: 'padClick',
            data: {
              padNum: padNum,
              userID: gUser._id
            }
          });
          console.log('padClick', $(aElement.target).attr('num'));
        },
        success: function (aData) {
          // showAlert('success', aData.message);
          var
            $button = $('button[num="' + aData.data.padNum + '"]'),
            $user = $('.user-item[user-id="' + aData.data.userID + '"]'),
            flip = $button.hasClass('btn-primary');

          $button.toggleClass('btn-primary', !flip).toggleClass('btn-danger', flip);
          $user.effect('pulsate', {times: 1}, 500);
        },
        failure: function (aData) {
          console.log('padClick failure');
          // showAlert('warning', aData.message);
        }
      },

      takeControl: {
        main: function (aElement) {
          var padNum = $(aElement.target).attr('num');
          console.log('takeControl', gUser._id);
          socket.emit('command', {
            command: 'takeControl',
            data: {
              padNum: padNum,
              userID: gUser._id
            }
          });
        },
        success: function (aData) {

          console.log('takeControl success aData: ', aData);

          var
            template = Handlebars.compile(gTemplates.glyph),
            html = template({
              glyph: 'knight'
            }),
            $button = $('button[num="' + aData.data.padNum + '"]'),
            $user = $('.user-item[user-id="' + aData.data.userID + '"]');

          $button.html(html);

          if (aData.notMe) {
            $button.addClass('under-their-control');
            $button.off();
            $button.css('color','red');
          }
          else {
            $button.addClass('under-my-control');
            $('body').on('keydown', function (key) {
              if ([37, 38, 39, 40].indexOf(key.which) > -1) {
                commands.moveButton.main(key.which);
              }
            });
            $button.css('color','lightgreen');
            $('.pad-button').off();
          }
        },
        failure: function (aData) {
          console.log('takeControl failure');
          // showAlert('warning', aData.message);
        }
      },
      moveButton: {
        main: function (aKeyNum) {
          socket.emit('command', {
            command: 'moveButton',
            data: {
              keyNum: aKeyNum,
              userID: gUser._id
            }
          });
        },
        success: function (aData) {
          var
            $button = !aData.notMe ? $('.under-my-control') : $('.under-their-control'),
            $user = $('.user-item[user-id="' + aData.data.userID + '"]'),
            direction = aData.direction,
            top = $button.position().top,
            left = $button.position().left,
            inc = 15,
            hit;

          switch (direction) {
            case 'forward':
              $button.css('top',  '-=' + ((top - inc) >= inc ? inc : (top - inc)) + 'px');
              break;
            case 'back':
              $button.css('top',  '+=' + inc + 'px');
              break;
            case 'left':
              $button.css('left',  '-=' + ((left - inc) >= inc ? inc : (left - inc)) + 'px');
              break;
            case 'right':
              $button.css('left',  '+=' + inc + 'px');
              break;
          }

          hit = $('.under-their-control').length !== 0 ?
            collision($('.under-my-control'), $('.under-their-control')) : false;

          if (hit) {
            console.log('you got him!!!!!');
          }

          $button.css('position', 'relative');
          $user.stop().effect('pulsate', {times: 1}, 50);
        },
        failure: function (aData) {
          console.log('moveButton failure');
          // showAlert('warning', aData.message);
        }
      },

      getUsers: {
        main: function (aUserSearch) {
          socket.emit('command', {
            command: 'getUsers',
            data: aUserSearch
          });
        },
        success: function (aData) {
          var user = aData.user;
          gUsers[user._id] = user;
          displayUsers(user);
        },
        failure: function (aData) {
          showAlert('warning', aData.message);
        }
      },
      signUp: {
        main: function () {
          socket.emit('command', {
            command: 'signUp',
            data: {
              username: $('.username').val(),
              password: $('.password').val()
            }
          });
        },
        success: function (aData) {
          commands.login.main();
        },
        failure: function (aData) {
          showAlert('warning', aData.message);
        }
      },
      login: {
        main: function (aData) {
          var
            data = aData !== undefined && aData._id !== undefined ?
              {
                _id: aData._id
              } : {
                username: $('.username').val(),
                password: $('.password').val()
              };

          socket.emit('command', {
            command: 'login',
            data: data
          });
        },
        success: function (aData) {
          showAlert('success', 'Welcome back: ' + aData.user.username);

          $('.login').remove();

          gUser = aData.user;

          // set cookie data of user
          var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
          // var inHalfAMinute = new Date(new Date().getTime() + 1 * 30 * 1000);
          Cookies.set('appUser',
            {
              _id: aData.user._id
            },
            {
              expires: inFifteenMinutes
            }
            // {
            //   expires: inHalfAMinute
            // }
          );

          // load app
          loadApp('buttons-app');
        },
        failure: function (aData) {
          // console.log('login failure: ', aData);
          showAlert('warning', aData.message);
        }
      },

      logout: {
        main: function (aElement) {
          socket.emit('command', {
            command: 'logout',
            data: {
              userID: gUser._id
            }
          });
        },
        success: function (aData) {
          var
            userLoggingOutID = aData.userID,
            userID = gUser._id,
            $user = $('.user-item[user-id="' + aData.userID + '"]');

          console.log(aData.userID, gUser._id, gUsers);

          if (userID === userLoggingOutID) {
            console.log('im loggin out bye bye');
            delete gUsers[aData.userID];
            Cookies.remove('appUser');
            loadLogin();
          }
          else {
            console.log('someone has logged out');
            $user.effect('pulsate', {times: 1}, 500);
            commands.getUsers.main({});
          }
        },
        failure: function (aData) {
          // console.log('logout failure');
          showAlert('warning', aData.message);
        }
      },
    };

  //----------------------------------------------------------
  //--------------------| EVENTS START |----------------------
  //----------------------------------------------------------

  // listen for 'click' event on login button and execute login main

  // listen for server emitting 'failure' event
  socket.on('failure', function (aData) {
    // get failure method of command
    var command = aData.failure;
    // run failure method of command
    commands[command].failure(aData);
  });

  // listen for server emitting 'success' event
  socket.on('success', function (aData) {
    // get success method of command
    var command = aData.success;
    //run success method of command
    commands[command].success(aData);
  });

  // listen for server emitting 'connected' event
  socket.on('connected', function (aData) {
    // console.log('connected', aData);
    var appUser = Cookies.getJSON('appUser');
    gUsers = {};
    loadTemplates(aData.templates);
    connected = true;

    if (appUser !== undefined) {
      // console.log('cookie userSocket: ', appUser);
      commands.login.main(appUser);
    }
    else {
      loadLogin();
    }
  });
  //----------------------------------------------------------
  //--------------------| EVENTS END |------------------------
  //----------------------------------------------------------
});
