# simple-regex
SimpleRegex is a simple regular expression library with verbal matching and variable binding.

Example:
```javascript
var dateStr = 'Thu Jan 14 16:23:24 HKT 2016';

var simpleRegex = new SimpleRegex(dateStr)
  .oneOrMany().letter().bindVar('dayOfWeek')
  .then(' ')
  .oneOrMany().letter().bindVar('month')
  .then(' ')
  .oneOrMany().number().bindVar('dayOfMonth')
  .then(' ')
  .until(' ').bindVar('time');

console.log(simpleRegex.matches);
```
