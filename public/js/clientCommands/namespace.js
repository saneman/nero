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
        collision: function ($div1, $div2) {
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
        randBetween: function (aFrom, aTo) {
          // get random number in range from: aFrom to: aTo
          return Math.floor(Math.random() * aTo) + aFrom;
        },
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
