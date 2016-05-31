// export all client commands to global "clientCommands"
module.exports = {
  signup: require('./signup'),
  login: require('./login'),
  logout: require('./logout'),
  getUsers: require('./get-users'),
  chess: require('./chess'),
  // moveButton: require('./move-button'),
  // takeControl: require('./take-control'),
  // padClick: require('./pad-click'),
  getTemplate: require('./get-template')
};
