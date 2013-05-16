#js-url.js

js-url.js is a utility module which provide functions for operating with url. 
It can be used both in the [node.js](http://nodejs.org) and browser.

##Documentation

* [urlParse](#urlParse)
* [urlFormat](#urlFormat)
* [parseQuery](#parseQuery)
* [formatQuery](#formatQuery)

<a name="urlParse" />
### urlParse(url_string)

Convert an url string to an url object. The keys and values of this object is shown in the following example.

__Example:__

    urlStr1 = 'http://user:pass@host.com:8080/p/a/t/h?query=string&query2=string2#hash';
    var newReference = urlUtils.urlParse(urlStr1);
    
__Result:__

    newReference == {
    "href":"http://user:pass@host.com:8080/p/a/t/h?query=string&query2=string2#hash",
    "path":"/p/a/t/h?query=string&query2=string2",
    "hash":"#hash",
    "search":"?query=string&query2=string2",
    "protocol":"http:",
    "auth":"user:pass",
    "host":"host.com:8080",
    "hostname":"host.com",
    "port":"8080",
    "pathname":"/p/a/t/h",
    "query":"query=string&query2=string2"
    }

<a name="urlFormat" />
### urlFormat(url_object)

Convert an url object to an url string.

__Example:__

    var url_string = urlUtils.urlFormat(newReference)
    
__Result:__

    url_string == 'http://user:pass@host.com:8080/p/a/t/h?query=string&query2=string2#hash'
    url_string == newReference.href
    
<a name="parseQuery" />
### parseQuery(query_string)

Convert an query string to an query object.

__Example:__

    var query_object = urlUtils.parseQuery(reference.search)
    
__Result:__

    query_object == {
    "query":"string",
    "query2":"string2"
    }
    
<a name="formatQuery" />
### formatQuery(query_object)

Convert an query string to an query object.

__Example:__

    var query_string = urlUtils.parseQuery(query_object)
    
__Result:__

    query_object == "?query=string&query2=string2"
    query_string == newReference.search
    
js-filio
========

#js-fileio.js

File-utils.js is a utility module which provide functions for operating with html file. It can be used both in the [node.js](http://nodejs.org) and browser.


HTTP request methods for Node.js and Browser (jQuery). Also, wrapping for file i/o and XML/JSON transformations using node-ObjTree.js

##Documentation

* [site](#site)
* [xml.url2json](#xml.url2json)
* [file().get](#file\(\).get)

<a name="site" />
### site(url_object, spec)

Initialize and return a xml object.

__Example:__

    fileUtils.site ( urlUtils.urlParse('http://www.inciteadvisors.com'), '')

<a name="xml.url2json" />
### xml.url2json( '', function)

Get the web information based on the url and save into a result object and pass it to the function. The result object consists of "request","code","header","data","ok","reason","tree","json","xml". 

__Example:__

    xml.url2json('', function (result_object) {
        ......
    });
    
__Result:__
    
Take http://www.inciteadvisors.com for example. The html object will be:
    <table>
    <tr>
    <th>Keys</th>
    <th>Description&Sample</th>
    </tr>
    <tr>
    <td>request</td>
    <td>{"hostname":"www.inciteadvisors.com",
    "port":"","path":"","method":"GET","body":{}}</td>
    </tr>
    <tr>
    <td>code</td>
    <td>200</td>
    </tr>
    <tr>
    <td>header</td>
    <td>{"date":"Tue, 14 May 2013 20:00:39 GMT","server":"Apache","accept-ranges":"bytes","vary":"Accept-Encoding","content-length":"17919","keep-alive":"timeout=5, max=100","connection":"Keep-Alive","content-type":"text/html"}</td>
    </tr>
    <tr>
    <td>data</td>
    <td>html code</td>
    </tr>
    <tr>
    <td>ok</td>
    <td>function</td>
    </tr>
    <tr>
    <td>reason</td>
    <td>function</td>
    </tr>
    <tr>
    <td>tree</td>
    <td>xml javascript object</td>
    </tr>
    <tr>
    <td>json</td>
    <td>convert xml javascript object to string</td>
    </tr>
    <tr>
    <td>xml</td>
    <td>xml string</td>
    </tr>
    </table>
    
<a name="file().get" />
### file().get(file_name, function)

Get the file information based on the given file name from the server and save into a result object and then pass to the function.

__Example:__

    fileUtils.file().get('/example.js', function (result_object) {
       ......
    });
    
__Result:__

    
