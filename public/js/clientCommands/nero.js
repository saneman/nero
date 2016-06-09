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

  var
    globals = namespace,
    gTemplates = globals.gTemplates,
    botsTemplate = handlebars.compile(gTemplates.bots)(),
    gameButtonsTemplate = handlebars.compile(gTemplates['game-buttons'])(),
    foodTemplate = handlebars.compile(gTemplates['game-food']),
    socket = globals.socket,
    collision = globals.collision,
    randBetween =  globals.randBetween,
    gs = {
      botCnt: 0,
      bots: [],
      food: {
        gift: []
      },
      showButtons: false,
      started: false
    },
    pgTop,
    pgBottom,
    pgleft,
    pgRight,
    food = function (aType) {
      var index = gs.food[aType].length;
      return {
        id: index,
        top: randBetween(pgleft, pgBottom - 30),
        left: randBetween(pgleft, pgRight - 30),
        name: aType + '[' + index + ']',
        type: aType
      };
    },
    bot = function () {
      this.name = 'bot[' + gs.botCnt + ']';
      gs.botCnt++;
    },
    addFood = function (aType) {
      var
        cnt = randBetween(1, 6),
        type = typeof aType === 'string' ? aType : 'gift';
      console.log('aType', type);
      for (var i = 0; i < cnt; i++) {
        gs.food[type].push(food(type));
      }
    },
    addBot = function () {
      // addFoodBales();
      gs.bots.push(new bot());
      // console.log('bot: ', gs.bots);
    },
    update = function (delta) {
      var fKey, gKey;
      // update food item on play ground
      for (fKey in gs.food) {
        for (gKey in gs.food[fKey]) {
          // if not on playground add gift
          if (!$('#' + gs.food[fKey][gKey].id).length) {
            $('.play-ground').append(foodTemplate(gs.food[fKey][gKey]));
          }
        }
      }
    },
    draw = function (interpolationPercentage) {
      // console.log('interpolationPercentage', interpolationPercentage);
      $('.game-button').toggleClass('hide', !gs.showButtons);
      // $('#fpsCounter').html('');
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
        // probably because the browser tab was put in the background.
        console.warn('Main loop panicked. Discarding ' + discardedTime + 'ms');
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
      $('.game-controls').html(gameButtonsTemplate);
      $('.play-ground').html('');
      pgTop = $('.play-ground').position().top;
      pgBottom = $('.play-ground').height();
      pgleft = $('.play-ground').position().left;
      pgRight = $('.play-ground').width();

      $('.spawn-bot-button').on('click', addBot);
      $('.add-food-gift-button').on('click', addFood);

      $('.start-game-button').on('click', function() {
        MainLoop.setUpdate(update).setDraw(draw).setEnd(end).start();
        gs.showButtons = true;
        gs.started = true;
        $('.start-game-button').toggleClass('hide');
        $('.stop-game-button').toggleClass('hide');
      });
      $('.stop-game-button').on('click', function() {
        console.log('stop game');
        MainLoop.setUpdate(update).setDraw(draw).setEnd(end).stop();
        gs.showButtons = false;
        gs.started = false;
        $('#fpsCounter').html('');
        $('.start-game-button').toggleClass('hide');
        $('.stop-game-button').toggleClass('hide');
      });
    }
  };
});
