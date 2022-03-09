const { $, JQuery } = require('jquery');

class API {
    static Get(url, data, callback) {
        $.get({
            url: 'http://localhost:42069/api/v1' + url,
            dataType: "application/json",
            data: data,
            done: function(data) {
                callback(data);
            }
        });
    }

    static Post(url, data, callback) {
        $.post({
            url: 'http://localhost:42069/api/v1' + url,
            dataType: "application/json",
            data: data,
            done: function(data) {
                callback(data);
            }
        });
    }
}

module.exports = { API };