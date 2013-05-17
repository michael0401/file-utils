#js-fileio.js

js-fileio.js is a utility module which provide functions for operating with html file. It can be used both in the [node.js](http://nodejs.org) and browser.


HTTP request methods for Node.js and Browser (jQuery). Also, wrapping for file i/o and XML/JSON transformations using node-ObjTree.js

##Example

[Link]()

##Methods

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

##Install

The source code is available for download from [GitHub](https://github.com/rranauro/js-fileio). 
Besides that, you can also install using Node Package Manager [npm](https://npmjs.org):

    npm install js-fileio
    
##License

