/* ===================================================
 * js-url.js v0.01
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
/*global _: true */

if (typeof _ === 'undefined') {
	if (typeof exports !== 'undefined') {
		require('underscore');
	} else {
		throw new Error('url-utils depends on underscore.js');
	}
}

(function() {
	"use strict";
	var urlUtils = {};
	
	var urlFormat = function (source) {
		var target = '';

		if (source) {
			target = source.protocol ? source.protocol + '//' : '';
			target = target + (source.auth ? source.auth + '@' : '');
			target = target + (source.host || (source.hostname || ''));
			target = target + (source.path || '');
			target = target + (source.hash || '');
		}
		return target;
	};
	urlUtils.urlFormat = urlFormat;

	var formatQuery = function (source) {
		var target = '?';

		_.each(source, function(value, name) {
			target += name + '=' + value + '&';
		});

		// clip the trailing '&'
		return (target.slice(0,target.length-1));
	};
	urlUtils.formatQuery = formatQuery;

	var parseQuery = function (queryString) {
		var qs = queryString;

		var tmp = qs.charAt(0) === '?' ? qs.slice(1).toLowerCase() : qs.toLowerCase()
			, qryobj = {};			

		tmp.split('&').forEach(function(pair) {
			if (pair.split('=').length > 1) {
				qryobj[pair.split('=')[0]] = pair.split('=')[1] || '';					
			}
		});
		return qryobj;	
	};
	urlUtils.parseQuery = parseQuery;

	var urlParse = function (url, query, slashes) {
		/*jslint sub: true */
		var tmpurl = (url && url.toLowerCase()) || ''
			, thisurl = _.extend({}, { 'href': url || '', 'path': '' })
			, segment;

		if (tmpurl.split('#').length > 1) {
			tmpurl.split('#').forEach(function() {
				thisurl.hash = '#' + url.split('#')[1];
			});				
		}

		if (tmpurl.split('?').length > 1) {
			tmpurl.split('?').forEach(function() {
				thisurl.search = '?' + url.split('?')[1].split('#')[0];
			});				
		}

		// http, https, ftp, gopher, file
		segment = tmpurl.split('//')[0].substr(0,3);
		if (segment === 'htt' || segment === 'ftp' || segment === 'gop' || segment === 'fil') {
			thisurl.protocol = tmpurl.split('/')[0];
		}

		// 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash'
		// 'http://www.example.com/a/b 
		// www.example.com
		// /a/b/c
		tmpurl.split('/').forEach(function(segment) {
			if (segment.split('@').length > 1) {
				thisurl.auth = segment.split('@')[0];
			}
		});

		if (tmpurl.split('//').length > 1) {
			segment = tmpurl.split('//')[1].split('/')[0];
			if (segment.split('@').length > 1) {
				thisurl.host = segment.split('@')[1];
			} else {
				thisurl.host = segment;
			}				
		}

		if (thisurl.host && thisurl.host.search(':')) {
			thisurl.hostname = thisurl.host.split(':')[0];
			thisurl.port = thisurl.host.split(':')[1] || '';
		}

		if (thisurl.host) {
			thisurl.path = 
			tmpurl.substr(tmpurl.search(thisurl.host)+thisurl.host.length);
		} else {
			thisurl.path = tmpurl;
		}

		thisurl.pathname = thisurl.path.split('?')[0];
		thisurl.path = thisurl.pathname + (thisurl.search || '');

		if (query && query === true && thisurl.search) {
			thisurl['query'] = parseQuery(thisurl['search']);
		} else {
			if (thisurl.hasOwnProperty('search')) {
				thisurl['query'] = thisurl['search'].slice(1);					
			}
		}
		if (slashes && slashes === true) {
			throw 'slashes is not supported in url() object.';
		}
		return thisurl;
	};
	urlUtils.urlParse = urlParse;
	
	// make these utilities available from Underscore.js
	_.mixin(urlUtils);

}())

