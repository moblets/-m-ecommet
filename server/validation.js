const https = require('https');

module.exports = {
  /**
   * Validate a given ID and saves the url
   * @param {Object}  data The moblet data
   * @param {Function} callback The callback that will be called when the
   * validation finishes. The callback parameters are a Boolean, that responds
   * if it's valid and an Object with the response data
   */
  moblet: function(data, callback) {
    console.log(data.clientUrl);
    var valid = false;
    var response = {};
    var options = {
      hostname: 'services.' + data.clientUrl,
      port: 443,
      path: '/rest/common/conf/store',
      method: 'GET'
    };

    var req = https.request(options, res => {
      var body = '';
      console.log(res.statusCode);

      // URL not found = response !== 200
      if (res.statusCode !== 200) {
        valid = false;
        response = {
          errors: {
            clientUrl: 'url_error'
          }
        };
      }

      // URL found. Capturing stream data on body
      res.on('data', chunk => {
        body += chunk;
      });

      // URL found. response finished
      res.on('end', function() {
        body = JSON.parse(body);
        console.log(body);
        console.log(data.clientId);
        console.log(body.clientHash);
        if (body.clientHash === undefined) {
          // Client HASH not found on response
          valid = false;
          response = {
            errors: {
              clientUrl: 'url_error'
            }
          };
        } else if (body.clientHash === data.clientId) {
          // Client HASH found on response AND match
          valid = true;
          response = {
            data: {
              apiUrl: 'https://services.' + data.clientUrl + '/rest/'
            }
          };
        } else {
          // Client HASH found on response but doesn't match
          valid = false;
          response = {
            errors: {
              clientId: 'url_hash_check'
            }
          };
        }
        callback(valid, response);
      });
    });

    req.end();

    req.on('error', error => {
      console.error(error);
      valid = false;
      response = {
        errors: {
          clientUrl: 'url_error'
        }
      };
      callback(valid, response);
    });
  }
};
