_ = require('underscore');
util = require('util');
auth = require('./auth').authorize;
require('../node-ObjTree/ObjTree');
urlUtils = require('./url-utils');
fileUtils = require('./file-utils');

console.log(util.inspect(auth, 2, null), typeof auth.auth);