// config for require
require.config({
  baseUrl : 'js/clientCommands',
  paths : {
    'jquery' : '../libs/jquery',
    'jqueryui' : '../libs/jquery-ui',
    'underscore' : '../libs/underscore',
    'bootstrap' : '../libs/bootstrap',
    'io' : '../libs/socket.io',
    'jscookie' : '../libs/js.cookie',
    'handlebars' : '../libs/handlebars',
    'bootstrapslider' : '../libs/bootstrap-slider'
  },
  shim : {
    'config' : {
      deps : ['underscore', 'jquery'],
      exports : 'config'
    },
    'jquery' : {
      exports : '$'
    },
    'bootstrap' : {
      deps : ['jquery']
    },
    'jqueryui' : {
      deps : ['jquery']
    },
    'bootstrapslider' : {
      deps : ['bootstrap']
    },
    'jscookie' : {
      deps: ['jquery']
    }
  }
});

// load app... duh
require(['load']);
