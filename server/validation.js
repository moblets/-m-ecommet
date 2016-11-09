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
    // var response = {};
    // if (data.clientId !== 'olar') {
    //   valid = true;
    // }
		var response = {
			data: {
				apiUrl: 'https://services.virtualkar.com.br/rest/',
				test: data
			}
		};
    callback(valid, response);
  }
};
