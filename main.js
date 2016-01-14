var RegexTools = function(targetString) {
    this._targetString = targetString;
    this._targetStringLength = targetString.length;

    this._currentPos = 0;
    this._lastMatch = null;
    this.matches = {};

    this.error = false;
}

function _matchTargetWithPattern(target, pattern, initPosInTarget) {
    var indexInPattern = 0,
        patternLength = pattern.length,
        targetPos;

    if (initPosInTarget === undefined) {
        initPosInTarget = 0;
    }

    while (indexInPattern < patternLength) {
        targetPos = initPosInTarget + indexInPattern;

        if (targetPos >= target.length) {
            // index out of bound
            return -1;
        }

        if (target[targetPos] === pattern[indexInPattern]) {
            indexInPattern++;
        } else {
            return -1;
        }
    }

    // return the length of the matched pattern
    return indexInPattern;
};

RegexTools.prototype.then = function(pattern) {
    var match = _matchTargetWithPattern(this._targetString, pattern, this._currentPos);

    if (match === -1) {
        this.error = true;
    } else {
        this._lastMatch = this._targetString.substr(this._currentPos, match);

        this._currentPos += match;
    }

    return this;
};

RegexTools.prototype.maybe = function(pattern) {
    var match = _matchTargetWithPattern(this._targetString, pattern, this._currentPos);

    if (match === -1) {
        this._lastMatch = '';
    } else {
        this._lastMatch = this._targetString.substr(this._currentPos, match);
        this._currentPos += match;
    }
    return this;
};

RegexTools.prototype.until = function(pattern) {
    // TODO
    return this;
};

RegexTools.prototype.bindVar = function(pattern) {
    this.matches[pattern] = this._lastMatch;
    return this;
};





var str = 'https://example.com:3000/test/index.php';

var domainName, port, filename;
var match = new RegexTools(str)
    .then('http').bindVar('Protocol')
    .maybe('s')
    .then('://').bindVar('domainName');

console.log(match.matches);
