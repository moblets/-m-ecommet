module.exports = {
  /**
   * Validate a given ID and saves the url
   * @param {Object}  data The moblet data
   * @param {Function} callback The callback that will be called when the
   * validation finishes. The callback parameters are a Boolean, that responds
   * if it's valid and an Object with the response data
   */
  moblet: function(data, callback) {
    var apiUriRegEl = /(https?:\/\/)([_a-z.0-9-]*)/i;

    var protName = data.apiUrl.split('://')[0] === 'http' ?
              'http' :
              'https';
    var prot = protName === 'http' ? require('http') : require('https');

    var apiUrl = data.apiUrl
      .replace(apiUriRegEl, '$2')
      .replace('/', '');
    console.log(apiUrl);
    var valid = false;
    var response = {};
    var options = {
      hostname: apiUrl,
      path: '/rest/common/conf/store'
    };
    console.log(protName);
    console.log(options);

    var req = prot.request(options, res => {
      var body = '';
      // URL not found = response !== 200
      if (res.statusCode !== 200) {
        valid = false;
        response = {
          errors: {
            apiUrl: 'api_url_error'
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
        if (body.clientHash === undefined) {
          // Client HASH not found on response
          valid = false;
          response = {
            errors: {
              apiUrl: 'api_url_error'
            }
          };
        } else if (body.clientHash === data.clientId) {
          // Client HASH found on response AND match
          valid = true;
          response = {
            data: {
              apiUrl: protName + '://' + apiUrl + '/rest/'
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
          apiUrl: 'api_url_error'
        }
      };
      callback(valid, response);
    });
  }
};
