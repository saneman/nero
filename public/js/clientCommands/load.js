// define what libs we need
define([
  'namespace',
  'io',
  'jscookie'
],

// callback method
function (namespace, io, Cookies) {

  "use strict";

  // get globals from the namespace
  var
    globals = namespace,
    // set up socket things on window thing
    socket = io();
  // set socket onto globals
  globals.socket = socket;
  // when socket recieves a 'connected' event start doing things
  socket.on('connected', function (aData) {
    // listen for server emitting 'success' event
    socket.on('success', function (aData) {
      var command = aData.success;
      // check if global method is availible
      if (globals[command]) {
        globals[command].success(aData);
      }
      else {
        console.log('wtf: ', command);
      }
    });
    // listen for server emitting 'failure' event
    socket.on('failure', function (aData) {
      if (globals[aData.failure]) {
        globals[aData.failure].failure(aData);
      }
      else {
        globals.showAlert('warning', aData.message);
      }
    });
    // load the "get-template" script
    require(['get-template'], function () {
      // once loaded call the main method of the "get-template" script
      globals.getTemplate.main();
    });
  });
});
