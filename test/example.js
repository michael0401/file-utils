require('../index');
var test = require('tape');

/* 
fileUtils.HTTP = Ajax;
fileUtils.server = server;
*/

var errors = 0
, urlStr1 = 'http://user:pass@host.com:8080/p/a/t/h?query=string&query2=string2#hash'
, reference = _.omit(require('url').parse(urlStr1), 'slashes');

// Documentation: https://npmjs.org/package/tape
test('urlUtils', function (t) {	
	t.plan(4);
	
	// node.js has its own urlParser. We still need these when we run in the browser. So, 
	// We use node as the reference. 
	_.keys(reference).forEach(function(key) { 
		errors += (reference[key] === _.urlParse(urlStr1)[key]) ? 0 : 1;
		if (reference[key] !== _.urlParse(urlStr1)[key]) {
			console.log(key, reference[key], _.urlParse(urlStr1)[key]);
		}
	});
	t.equal(_.keys(reference).length, _.keys(_.urlParse(urlStr1)).length);
	t.equal(errors, 0);
	
	errors = _.urlFormat(reference) === reference.href ? 0 : 1;
	t.equal(errors, 0, _.urlFormat(reference));
	
	errors = (_.formatQuery(_.parseQuery(reference.search))) === reference.search 
		? 0 
		: _.formatQuery(_.parseQuery(reference.search));
	t.equal(errors, 0, errors);
	
});

test('fileUtils', function(t) {
	t.plan(2);
	
	fileio.file().get('/example.js', function (err, response) {
		t.equal(response.code, 200);
	});
	
	fileio.site(_.urlParse('http://www.inciteadvisors.com'), '')
		.url2json('', function (err, response) {
			t.equal(response.code, 200);
	});
});
