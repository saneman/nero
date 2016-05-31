define([
],

function ($) {

  "use strict";

  // return headless function # constructor
  return function () {
    // return object
    return {
      mArgs: arguments[0],
      main: function () {
        var apples = this.mArgs.apples;
        console.log('app 2 hello ' + apples);
      },
      success: function () {
        console.log('app 2 success');
      },
      failure: function () {
        console.log('app 2 failure');
      }
    };
  };
});
