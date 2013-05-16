/* ===================================================
 * file-io.js v0.01
 * https://github.com/rranauro/boxspringjs
 * ===================================================
 * Copyright 2013 Incite Advisors, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

/*jslint newcap: false, node: true, vars: true, white: true, nomen: true  */
/*global _: true, $: true, XML: true */


(function(global) {
	"use strict";
	var http
	, fs
	, fileUtils
	, browser;

	if (typeof exports !== 'undefined') {
		browser = false;
		fileUtils = exports;
		http = module.require('http');
		fs = module.require('fs');
	} else {
		browser = true;
		fileUtils = global.fileUtils = {};
	}
	
	// return values from $.ajax
	var  xhrStringValues = {
		'success': function() { return null; },
		'notmodified': function() { return null; },
		'error': function(code) { return new Error('$ajax error ' + code); },
		'timeout': function(code) { return new Error('$ajax timeout ' + code); }, 
		'abort': function(code) { return new Error('$ajax abort ' + code); }, 
		'parsererror': function(code) { return new Error('$ajax error ' + code); } 
	};

	var HTTP = function(server, user) {
		var	Basic
			,Cookie
			,auth = (user && (user.name + ':' + user.password)) || ''
			,host = (server && server.host) || (server && server.hostname)
			,port = server && server.port
			,that = {}
			// Purpose: helper to interpret the http status code
			, reason = function (o) {
				var codes = {}
				, select = o && o.code;
								
				codes['200'] = 'OK';
				codes['201'] = 'CREATED';
				codes['300'] = 'ACCEPTED';
				codes['304'] = 'NOT MODIFIED'; 
				codes['400'] = 'BAD REQUEST'; 
				codes['401'] = 'UNAUTHORIZED'; 
				codes['404'] = 'NOT FOUND'; 
				codes['405'] = 'METHOD NOT ALLOWED';
				codes['409'] = 'CONFLICT';
				codes['412'] = 'PRECONDITION FAILED';
				codes['500'] = 'INTERNAL SERVER ERROR';
				codes['600'] = 'PROGRAM ERROR';
				codes.ECONNRESET = 'CONNECTION RESET';
				return(codes[select]);					
			}
			// Purpose: helper to add the 'rev' code to io requests
			, result = function (o) {
				var that = o || {};
				if (o && o.header && o.header.etag) {
					_.extend(o, { 'rev': o.header.etag.replace(/\"/g, '').replace(/\r/g,'') });
				}

				o.ok = function () {
					return (o.code === 200 || o.code === 201); 
				};

				o.reason = function () {
					if (!o.ok() && o.error) {
						return reason(o) + ': ' + o.error;					
					} 
					if (!o.ok() && o && o.data && o.data.reason) {
						return reason(o) + ': ' + (o && o.data && o.data.reason.slice(0,50)) || '';										
					} 
					return reason(o);
				};
				return that;
			}
			// Purpose: parses a JSON object with 'catch' to just return the input if the parse fails.
			, parse = function (s, ctype) {
				var parsed = {}
					,contentType = (typeof ctype !== 'undefined') ? ctype.split(';')[0] : undefined;
				if (s === '') {
					return '';
				} 

				if (contentType === 'application/json') {
					// ajax sometimes returns .html from the root directory
					if (s.toUpperCase().substr(2,8) === "DOCTYPE") {
						return s;
					} 
					try {
						parsed = JSON.parse(s);
					} catch (e) {
						return s;
					}
					return parsed;
				}
				return s;					
			};	

		if (server && !_.has(server, 'file') && !(_.has(server, 'hostname') || _.has(server, 'host'))) {
			throw new Error('error: missing hostname or port required for Ajax calls - ' + JSON.stringify(server));
		}	

		if (user && user.auth) {
			Basic = "Basic " + new Buffer(user.auth, "ascii").toString("base64");
		}

		var nodeGet = function (opts, callback) {
			//console.log('nodeGet, user:', user);
			//console.log('file-utils nodeGet', opts, typeof callback);
			var stream = ''		// node.js ajax request function		
				,req;
			req = http.request(opts, function(res) {
				//console.log('nodeGet rquest', typeof res);				
				res.setEncoding('ascii');
				res.on('data', function (chunk) {
					stream = stream + chunk;
				});
				res.on('end', function() {
					//console.log('nodeGet on end', res.statusCode);
					// callback pattern
					if (callback && typeof callback === 'function') {
						callback(null, result({
							request: _.omit(opts, 'agent', 'auth'),
							code: res.statusCode,
							header: res.headers,
							data: parse(stream, res.headers['content-type'])								
						}), res);
					}

					if (_.has(res.headers, 'set-cookie')) {
						Cookie = res.headers['set-cookie'];
					}
				});			
			});

//			if (Basic) {
//				req.setHeader('Authorization', Basic);
//			}

			req.setHeader('Connection', 'keep-alive');
			req.setHeader('Content-type', 'application/json');													
			req.setHeader('Accept', 'application/json');

			req.on('error', function(e) {
				if (callback && typeof callback === 'function') {
					callback(e);
				}
			});

			if ((opts.body !== '') && (opts.method === 'PUT' || opts.method === 'POST')) {
				req.write(opts.body);
			}
			req.end();
		};

		// Purpose: jQuery ajax call returns header string. 
		// Parse it into an object, remove leading spaces from key/value
		var parseHdr = function (hdr) {
			var parseArray = hdr.split('\n')
				,header = {};
			_.each(parseArray, function(element) {
				var hdrItem = element.split(':');
				if (hdrItem.length > 1 && hdrItem[0] !== '') {
					header[hdrItem[0].toLowerCase()] = hdrItem[1].replace(' ','');																		
				}
			});
			return (header);
		};

		if (browser) {
			// won't change from call to call
			$.ajaxSetup({
				'accepts': {'json': 'application/json' },
				'dataType': "json",
				'username': user && user.name,
				'password': user && user.password,
				'converters': {
					"text json": function( stream ) {
						parse(stream, 'application/json');
					}
				}
			});
		}

/*
processData: false _config, {dbname}, 
save: before send fullcommit options
*/	
		var jqueryGet = function (opts, callback) {
			var defaultAjaxOpts = { // can change from call to call
					'contentType': "application/json",
					'headers': {
						"Accept": "application/json"
					}
				};

			// extend the options with the defaults, and the ajax logic
			opts = _.extend(defaultAjaxOpts, opts, {	
				beforeSend: function(xhr) {
					_.each(opts.headers, function(item, index) {
						xhr.setRequestHeader(index, item);						
					});
		        },
		        complete: function(jqXHR, xhrString) {
					//var resp = httpData(req, "json");
					//console.log(jqXHR.responseText);
					if (callback && typeof callback === 'function') {
						callback(xhrStringValues[xhrString](jqXHR.status), result({
							request: _.exclude(opts, 'agent', 'auth'),
							method: opts.type,
							code: jqXHR.status,
							header: parseHdr(jqXHR.getAllResponseHeaders()),
							data: parse(jqXHR.responseText, this.contentType)
						}));
					}
				}
			});
			$.ajax(_.extend(opts));
		};

		// Purpose: manages parameters for differing ajax interfaces, such as node.js and jquery
		var get = function(opts, callback) {
			//console.log('file-utils get', opts, typeof callback);
			// if the object is set with a 'file' path, instead of a 'host' or 'hostname', 
			// then just read the file keeps the interface the same for http or file requests			
			if ((server && server.file) || (server && server['server-root'])) {
				opts = typeof opts === 'string' ? opts : ((opts && opts.path) || '');
				if (browser === true) {
					fileUtils.readFile(server['server-root'], opts, callback);					
				} else {					
					fileUtils.readFile(server.file, opts, callback);					
				}
				return;
			}	

			if (browser === true) {
				// data objects are strings for PUT. 
				if (opts.method && (opts.method==='PUT' || opts.method==='POST')) {	
					// check the content type first
					if (_.fetch(opts, 'Content-Type') === 'application/x-www-form-urlencoded') {
						_.extend(opts, { 'data': opts.body || {}, 'processData': false });
					} else {
						_.extend(opts, { 'data': (JSON.stringify(opts.body || {})).replace(/\r/g, '') });
					}	
				} 
				jqueryGet({
					'url': typeof opts==='string' ? opts : (_.has(opts, 'path') ? opts.path : ''),
					'type': opts.method,
					'contentType': _.fetch(opts, 'Content-Type') || 'application/json',
					'headers': opts.headers,
					'data': opts.data }, callback);
			} else {
				nodeGet({ 
					'hostname': host, 
					'port': port, 
					'path': opts === '' ? '' : opts && opts.path,
					'method': (opts && opts.method) || 'GET',
					'body': (opts && opts.body && JSON.stringify(opts.body)) || {},
					'auth': auth }, callback);
			}				
		};
		that.get = get;

		var Xml = function(Spec) {
			var that = Spec || {}
				, xotree = new XML.ObjTree();
				
			var force_array = function(opts) {
				if (_.isArray(opts)) {
					xotree.force_array = opts;									
				} else {
					console.trace();
					throw 'force_array arguments must be an array';
				}
				return this;
			};
			that.force_array = force_array;

			var xml2json = function (xmlstr, fn) {
				var tree = {}
				, err = null;

				try {
				    tree = xotree.parseXML(xmlstr);				
				} catch (e) {
					err = new Error(' [ XML2JSON ] -' + e);				
				}

	            if (fn && typeof fn === 'function') {
	                fn(err, tree, JSON.stringify(tree), xmlstr);
	            }
				return this;
			};
			that.xml2json = xml2json;

			var url2json = function (url, func) {					
				if (get && typeof get === 'function') {
					get(url, function(err, result) {
						if (err) {
							return func ( new Error(err) );
						}
						xml2json(result.data, function(err, tree, json, xml) {
							_.extend(result, { 'tree': tree, 'json': json, 'xml': xml });
							func(null, result);
						});						
					});
				}
				return this;
			};
			that.url2json = url2json;
			return that;
		};
		that.Xml = Xml;
		return that;
	};
	fileUtils.HTTP = HTTP;

	// Purpose: Listen for REST API requests on the provided port
	var server = function (port, serviceFunc) {
		var http = require("http");

		http.createServer(function(request, response) {
			var result = serviceFunc(request);

		  response.writeHead((result && result.code) || 500, {"Content-Type": "text/plain"});
		  response.write((result && result.body) || '');
		  response.end();
		}).listen(port);

	};
	fileUtils.server = server;
	
	var writeFile = function(f, data, handler) {		
		fs.writeFile(f, data, function (err) {
			if (handler && typeof handler === 'function') {
				handler(err);
			}
		});
	};
	fileUtils.writeFile = writeFile;

	var readFile = function(root, f, myhandler) {
		var handler = (myhandler && myhandler.fn) || myhandler
			, request = { 'path': f, 'root': root };

		if (browser === true) {
			$.ajax({
				'url': root+f,
				'type': 'GET',
				'dataType': 'text',
				'complete': function(data, err) {
					if (handler && typeof handler === 'function') {
						handler(xhrStringValues[err](err), {
							'request': request,
							'code': err === 'success' ? 200 : err,
							'data': data
						});
					}
				}
			});
		} else {
			fs.readFile(root+f, 'ascii', function (err, data) {
				if (handler && typeof handler === 'function') {
					handler(err, {
						'request': request,
						'code': (err && err.code) || 200,
						'data': data
					});
				}
			});			
		}	
	};
	fileUtils.readFile = readFile;

	var readCSV = function (sourceFile, delimit, handler) {
		var that = {}
			, delimiter = delimit || ',';
		
		var process = function (arg) {
			var data = sourceFile || arg
				, lines = []
				, header = []
				, nextLine = function () {
					return({});
				}
				, thisLine
				, line
				, currentLine
				, j;

			try {
				// parsing a delimter separated file. Consider first line as header,
				// use the tokens as keys for each remaining line.
				lines = data.split('\n');
				header = lines[0].split(delimiter);

				// for each line, beginning with line 1 (line 0 is the header)
				for (currentLine = 1; currentLine < lines.length; currentLine += 1) {
					line = lines[currentLine].split(delimiter);
					if (line.length !== header.length) {
						throw new Error('[ readCSV ] invalid-delimiter - '+ currentLine);
					} else {
						// for each field, generate an entry name: field
						thisLine = nextLine();
						for (j = 0; j < header.length; j += 1) {
							thisLine[header[j]] = line[j]; 
						}
						// call the handler with an object for each line
						if (handler && typeof handler === 'function') {
							handler(header, thisLine, currentLine===(lines.length-1));
						}
					}
				} 
			} catch (e) {
				//throw ('json parse error', e);
				throw 'error: processing CSV file, ' + e;
			}				
		};
		that.process = process;

		var read = function () {
			readFile(sourceFile, function(err, data) {
				if (err !== null) {
					throw new Error('[ readCSV/read ] bad source file - ' + err.message);
				} else {
					process(data);
				}
			});				
		};
		that.read = read;
		return that;
	};
	fileUtils.readCSV = readCSV;
	
	var file = function () {
		return (HTTP(auth.file));
	};
	fileUtils.file = file;

/*
var parsed = _.urlParse(url).hasOwnProperty('hostname') 
				? _.urlParse(url)
				: _.urlParse('http://' + url);
*/	

	var site = function (parsedURL, spec) {
		var parsed = parsedURL.hasOwnProperty('hostname') 
						? parsedURL
						: global.urlUtils.urlParse('http://' + parsedURL);
		return HTTP(parsed).Xml(spec);
	};
	fileUtils.site = site;
	return fileUtils;	
}(this));
