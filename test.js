var SimpleRegex = require('./simple-regex');

var str = 'ftp://example.com:3000/test/';

var domainName, port, filename;
var regex = new SimpleRegex(str)
    .oneOf('http', 'ftp').bindVar('Protocol')
    .then('://')
    .until('.com').replaceWith('foobar')
    .then('.com').replaceWith('.io')
    .then(':3000/')
    .until('/').replaceWith('main');

console.log(regex.getReplacedString());
