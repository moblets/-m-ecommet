module.exports = {
  /**
   * Validate a given ID and saves the url
   * @param {String}  id The client id
   * @param {Function} callback The callback that will be called when the
   * validation finishes. The callback parameters are a Boolean, that responds
   * if it's valid and an Object with the response data
   */
  clientId: function(id, callback) {
    var valid = false;
    var response = {};
    if (id !== 'olar') {
      valid = true;
    }
		response = {
			data: {
				apiUrl: 'https://services.virtualkar.com.br/rest/'
			}
		};
    callback(valid, response);
  }
};
