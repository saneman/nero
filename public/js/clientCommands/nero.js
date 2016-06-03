/* jshint esversion: 6 */

define([
  'namespace',
  'jscookie',
  'handlebars',
  'bootstrap',
  'jqueryui',
  'bootstrapslider',
  'mainLoop'
],

function (namespace, Cookies, handlebars) {

  "use strict";

  const naai = 2;

  // console.log(naai);


  var
    globals = namespace,
    gTemplates = globals.gTemplates,
    botsTemplate = handlebars.compile(gTemplates.bots)(),
    spawnBotButtonTemplate = handlebars.compile(gTemplates['spawn-bot-button'])(),
    socket = globals.socket,
    gBotCnt = 0,
    bots = [],
    bot = function () {
      this.name = 'bot[' + gBotCnt + ']';
      gBotCnt++;
    },

    addFoodBales = function () {
      var
        // get random number between 1 and 6
        baleCnt = globals.getRandomNumberBetween(1, 6),
        pgWidth = $('.play-ground').width(),
        pgHeight = $('.play-ground').height();
        // console.log('dropping ' + baleCnt + ' bales of food');
      globals.showAlert('success', 'dropping ' + baleCnt + ' bales of food');




        console.log('pgWidth: ', pgWidth);
        console.log('pgHeight: ', pgHeight);

    },
    addBot = function () {
      addFoodBales();
      bots.push(new bot());
      console.log('bot: ', bots);
    },
    update = function (delta) {
      console.log('updte game delta:', delta);
    },
    draw = function (interpolationPercentage) {
      // console.log('interpolationPercentage', interpolationPercentage);
    },
    end = function (fps, panic) {
      $('#fpsCounter').html(parseInt(fps, 10) + ' FPS');
      if (panic) {
        // This pattern introduces non-deterministic behavior, but in this case
        // it's better than the alternative (the application would look like it
        // was running very quickly until the simulation caught up to real
        // time). See the documentation for `MainLoop.setEnd()` for additional
        // explanation.
        var discardedTime = Math.round(MainLoop.resetFrameDelta());
        console.warn('Main loop panicked, probably because the browser tab was put in the background. Discarding ' + discardedTime + 'ms');
      }
    };

  globals.nero = {
    main: function (aData) {
      console.log('nero: main');
      socket.emit('command', {
        command: 'nero',
        data: aData
      });
    },
    success: function (aData) {
      console.log('nero: success', aData);
    },
    failure: function (aData) {
      console.log('nero: failure');
    },
    render: function () {
      $('.main').html(botsTemplate);
      $('.bot-controls').html(spawnBotButtonTemplate);
      $('.spawn-bot-button').on('click', addBot);
      // Start the main loop.

      // console.log('mainLoop', mainLoop);

      // $('#fps').on('input', function() {
      //     fpsValue.textContent = Math.round(this.value);
      // });

      MainLoop.setUpdate(update).setDraw(draw).setEnd(end).start();
    }
  };
});
