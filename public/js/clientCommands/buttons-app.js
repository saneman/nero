define([
  'namespace',
  'jscookie',
  'handlebars',
  'bootstrap',
  'jqueryui',
  'bootstrapslider'
],

function (namespace, Cookies, handlebars) {

  "use strict";

  var
    globals = namespace,
    gTemplates = globals.gTemplates,
    template = handlebars.compile(gTemplates['buttons-app'])();

  globals.buttonsApp = {
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
            globals.moveButton.main(key.which);
          }
        });
        $button.css('color','lightgreen');
        $('.pad-button').off();
      }
    },
    failure: function (aData) {
      console.log('takeControl failure');
      // showAlert('warning', aData.message);
    },
    render: function () {
      $('.main').html(template);

      $('.pad-button').off().on('click', globals.buttonsApp.main);
    }
  };
});
