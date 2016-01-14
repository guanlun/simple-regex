var SimpleRegex = require('./simple-regex');

//var str = 'ftp://example.com:3000/test/';

//var regex = new SimpleRegex(str)
//    .oneOf('http', 'ftp').bindVar('protocol')
//    .then('://')
//    .until('.com').replaceWith('foobar')
//    .then('.com').replaceWith('.io')
//    .then(':')
//    .oneOrMany().number()
//    .then('/')
//    .until('/').replaceWith('main');
//
//console.log(regex.getReplacedString());

var dateStr = 'Thu Jan 14 16:23:24 HKT 2016';

var regex = new SimpleRegex(dateStr)
    .oneOrMany().letter().bindVar('dayOfWeek')
    .then(' ')
    .oneOrMany().letter().bindVar('month')
    .then(' ')
    .oneOrMany().number().bindVar('dayOfMonth')
    .then(' ')
    .until(' ').bindVar('time')
    .then(' ')
    .is('H').bindVar('haha')
    .letter().bindVar('hehe');

console.log(regex.matches);
