var SimpleRegex = require('./simple-regex');

var str = 'ftp://example.com:3000/test/';

var domainName, port, filename;
var match = new SimpleRegex(str)
    .oneOf('http', 'ftp').bindVar('Protocol')
    .then('://')
    .until('.com').bindVar('domainName')
    .then('.com:');

console.log(match.matches);
