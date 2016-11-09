module.exports = {
  /**
   * Validate a given ID and saves the url
   * @param {String}  id The client id
   * @param {Function} callback The callback that will be called when the
   * validation finishes. The callback parameters are a Boolean, that responds
   * if it's valid and an Object with the response data
   */
  moblet: function(data, callback) {
    var valid = true;
		// Validation debug
		// In the future, test if it's a valid client ID
    if (data.clientId == 'olar') {
      valid = false;
    }
		// Get apiUrl from the API if possible
		var response = {
			data: {
				apiUrl: 'https://services.virtualkar.com.br/rest/',
			}
		};
		// if not possible, add to the form.json
		// ,
		// {
    //   "name": "baseApiUrl",
    //   "type": "text",
    //   "required": true,
    //   "min-length": 13,
    //   "max-length": 120
    // }
    callback(valid, response);
  }
};
