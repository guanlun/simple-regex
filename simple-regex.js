module.exports = (function() {
    var SimpleRegex = function(targetString) {
        this._targetString = targetString;
        this._targetStringLength = targetString.length;

        this._currentIndex = 0;
        this._lastMatch = null;
        this.matches = {};

        this.error = false;
    }

    /**
     * Util function for matching the target string with a pattern
     *
     * @param {String} target The target string
     * @param {String} pattern
     * @param {Number} initTargetIndex The starting position in the target string, defaults to 0
     * @return -1 if not matched, otherwise returns the length of the match
     */
    function _matchTargetWithPattern(target, pattern, initTargetIndex) {
        var patternIndex = 0,
            patternLength = pattern.length,
            targetIndex;

        if (initTargetIndex === undefined) {
            initTargetIndex = 0;
        }

        while (patternIndex < patternLength) {
            targetIndex = initTargetIndex + patternIndex;

            if (targetIndex >= target.length) {
                // index out of bound
                return -1;
            }

            if (target[targetIndex] === pattern[patternIndex]) {
                patternIndex++;
            } else {
                return -1;
            }
        }

        // return the length of the matched pattern
        return patternIndex;
    };

    /**
     * Match the exact pattern, if there's no match the "error" flag would be turned on
     *
     * @param {String} pattern
     * @return The "this" object
     */
    SimpleRegex.prototype.then = function(pattern) {
        var match = _matchTargetWithPattern(this._targetString, pattern, this._currentIndex);

        if (match === -1) {
            this.error = true;
        } else {
            this._lastMatch = this._targetString.substr(this._currentIndex, match);

            this._currentIndex += match;
        }

        return this;
    };

    /**
     * Match pattern or skip if there's no match
     *
     * @param {String} pattern
     * @return The "this" object
     */
    SimpleRegex.prototype.maybe = function(pattern) {
        var match = _matchTargetWithPattern(this._targetString, pattern, this._currentIndex);

        if (match === -1) {
            this._lastMatch = '';
        } else {
            this._lastMatch = this._targetString.substr(this._currentIndex, match);
            this._currentIndex += match;
        }
        return this;
    };

    /**
     * Match one of the pattern parameters
     *
     * @param {Array} a list of patterns to be matched
     * @return The "this" object
     */
    SimpleRegex.prototype.oneOf = function() {
        var argc = arguments.length;
        for (var i = 0; i < argc; i++) {
            var pattern = arguments[i];
            var match = _matchTargetWithPattern(this._targetString, pattern, this._currentIndex);

            if (match !== -1) {
                this._lastMatch = this._targetString.substr(this._currentIndex, match);
                this._currentIndex += match;

                return this;
            }
        }

        this.error = true;
        return this;
    };

    /**
     * Match until the next occurrence of the pattern and update the current pointer to the
     * beginning of that pattern.
     * e.g., after calling "until" on string "example.com/abc" with pattern ".com", the next
     * matching would start from ".com" rather than "/abc"
     *
     * @param {String} pattern
     * @return The "this" object
     */
    SimpleRegex.prototype.until = function(pattern) {
        var patternLength = pattern.length,
            targetStartingPos = this._currentIndex;

        while (true) {
            var patternMatched = true;

            for (var patternIndex = 0; patternIndex < patternLength; patternIndex++) {
                // iterate through each char in the pattern
                var targetIndex = targetStartingPos + patternIndex;

                if (targetIndex >= this._targetStringLength) {
                    // index out of bounds, mark error and stop
                    this.error = true;
                    return this;
                }

                if (this._targetString[targetIndex] !== pattern[patternIndex]) {
                    // not matching, break the inner loop and move on to the next target position
                    patternMatched = false;
                    break;
                }
            }

            if (patternMatched) {
                // targetStartingPos is the index where the matched "until" pattern starts
                this._lastMatch = this._targetString.substr(
                    this._currentIndex,
                    targetStartingPos - this._currentIndex);

                // advance to the starting index of the "until" pattern
                this._currentIndex = targetStartingPos;
                return this;
            }

            targetStartingPos++;
        }

        return this;
    };

    /**
     * Bind a variable name to the last matched pattern
     *
     * @param varName Name of the key to be added to the "matches" object
     * @return The "this" object
     */
    SimpleRegex.prototype.bindVar = function(key) {
        this.matches[key] = this._lastMatch;
        return this;
    };

    return SimpleRegex;
}());
