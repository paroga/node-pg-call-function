'use strict';

function buildQueryText(name, count) {
  var parameters = new Array(count);
  for (var i = 0; i < count; ++i)
    parameters[i] = '$' + (i + 1);
  parameters = parameters.join(',');
  return 'SELECT*FROM ' + name + '(' + parameters + ')';
}

function callFunction(options, values, callback) {
  var client = this;
  var config = {};

  if (typeof options === 'string')
    config['function'] = options;
  else
    config = options;

  config.text = buildQueryText(config['function'], values.length);
  return client.query(config, values, function(err, result) {
    if (err)
      return callback(err);

    var args = [null];
    var row = result.rows[0];
    result.fields.forEach(function(field) {
      args.push(row[field.name]);
    });
    callback.apply(null, args);
  });
}

callFunction.extend = function extend(pg) {
  pg.Client.prototype.callFunction = callFunction;
};

module.exports = callFunction;
