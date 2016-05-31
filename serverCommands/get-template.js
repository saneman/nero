module.exports = function (aData, socket, db, gUsers) {
  // directory on sever where templates are kept
  var dir = __dirname + '/../templates/';
  // get the list of templates
  getTemplateList(function (aList) {
    // get the count of the templates to be sent to the client
    var templateCount = aList.length;
    // loop thorugh list of templates
    for (var fKey in aList) {
      // read contents of template
      fs.readFile(dir + aList[fKey], 'utf8',
        // callback when file is read into memory
        (function(filename, err, data) {
          var
            // set data being returned to the client
            returnData = {
              // success flag for "getTemplate" to front end knows what to do
              success: 'getTemplate',
              // name of the template being sent to client
              templateName: filename.split('.tmpl')[0],
              // contents of the template
              template: data,
              // count of templates to be sent to client
              templateCount: templateCount
            };
          // send "success" event to the front end with data
          socket.emit('success', returnData);
        // bind the filename in the list to the variable "filename" in callback
        }).bind(null, aList[fKey])
      );
    }
  });
};
