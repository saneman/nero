define([
  'handlebars'
],

(function () {

  "use strict";

  // return headless function # constructor
  return function (Handlebars) {

    // return object
    return {
      // globals: {
        commands: {},
        gTemplates: {},
        gAlertCnt: 1,
        gAlertTime: 4000,
        gUsers: {},
        gUser: {},
        updateProgressBar: function (aGTCnt, aTCnt, aFile) {
          var percent = (aGTCnt / aTCnt) * 100;
          $('.progress-bar').attr('aria-valuenow', percent);
          $('.progress-bar').css('width', percent + '%');
        },
        // basic alert to user in bottom right corner
        showAlert: function (aType, aMessage) {
          if (this.gTemplates.alert) {
            var
              template = Handlebars.compile(this.gTemplates.alert),
              alertID = 'alert' + this.gAlertCnt,
              current = $('.main-alert'),
              html = template({
                id: alertID,
                class: aType,
                message: aMessage,
              });
            $('.alert-box').append(html);
            $('#' + alertID).fadeOut(this.gAlertTime, 'swing', function () {
              $(this).remove();
            });
            this.gAlertCnt++;
          }
        },
        loadTemplates: function (aTemplates) {
          for (var tKey in aTemplates) {
            this.gTemplates[tKey] = aTemplates[tKey];
          }
        }
      // }
    };
  };
})());
