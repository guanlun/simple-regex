module.exports = (function() {
    var SimpleRegex = function(targetString) {
        this._targetString = targetString;
        this._targetStringLength = targetString.length;
        this._replacedString = targetString;

        // Keep track of the length difference in the replaced string and the original target
        // string, equals to (this._replacedString.length - this._targetString.length)
        this._replaceLengthDiff = 0;

        this._currentIndex = 0;
        this._lastIndex = 0;

        this._modifier = null;

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
            this._updateIndex(this._currentIndex + match);
        }

        return this;
    };

    /**
     * Register a modifier that matches charaters or skip if there's no match
     *
     * @return The "this" object
     */
    SimpleRegex.prototype.maybe = function() {
        var self = this;

        this._modifier = function(matchFunction) {
            var targetIndex = self._currentIndex;

            if (matchFunction(self._targetString[targetIndex])) {
                self._updateIndex(self._currentIndex + 1);
            } else {
                self._lastMatch = '';
            }
        };

        return this;
    };

    SimpleRegex.prototype.one = function() {
        var self = this;

        this._modifier = function(matchFunction) {
            var targetIndex = self._currentIndex;

            if (matchFunction(self._targetString[targetIndex])) {
                self._updateIndex(self._currentIndex + 1);
            } else {
                self.error = true;
            }
        };

        return this;
    };

    /**
     * Register a modifier that matches at least one or more than one characters
     *
     * @return The "this" object
     */
    SimpleRegex.prototype.oneOrMany = function() {
        var self = this;

        this._modifier = function(matchFunction) {
            var targetIndex = self._currentIndex;

            while (targetIndex < self._targetStringLength) {
                var char = self._targetString[targetIndex];

                if (matchFunction(char)) {
                    targetIndex++;
                } else {
                    if (targetIndex === self._currentIndex) {
                        // Faied to match the first char but this method requires matching at least
                        // one, mark the error flag
                        this.error = true;
                    }
                    break;
                }
            }

            this._updateIndex(targetIndex);
        };

        return this;
    };

    SimpleRegex.prototype.number = function() {
        if (this._modifier) {
            this._modifier(function(char) {
                return ('0' <= char) && (char <= '9');
            });

            // Reset the modifier to null after it's used
            this._modifier = null;

            return this;
        } else {
            // No modifier specified, use "one" as default modifier (match exactly one)
            return this.one().number();
        }
    };

    SimpleRegex.prototype.letter = function() {
        if (this._modifier) {
            this._modifier(function(char) {
                return (('a' <= char) && (char <= 'z')) || (('A' <= char) && (char <= 'Z'));
            });

            // Reset the modifier to null after it's used
            this._modifier = null;

            return this;
        } else {
            // No modifier specified, use "one" as default modifier (match exactly one)
            return this.one().letter();
        }
    };

    SimpleRegex.prototype.is = function(matchingChar) {
        if (this._modifier) {
            this._modifier(function(char) {
                return (matchingChar === char);
            });

            // Reset the modifier to null after it's used
            this._modifier = null;

            return this;
        } else {
            // No modifier specified, use "one" as default modifier (match exactly one)
            return this.one().is(matchingChar);
        }
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
                this._updateIndex(this._currentIndex + match);

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
                // targetStartingPos is the index where the matched "until" pattern starts,
                // advance to the starting index of the "until" pattern
                this._updateIndex(targetStartingPos);
                return this;
            }

            targetStartingPos++;
        }

        return this;
    };

    /**
     * Bind a variable name to the last matched segment
     *
     * @param varName Name of the key to be added to the "matches" object
     * @return The "this" object
     */
    SimpleRegex.prototype.bindVar = function(key) {
        this.matches[key] = this._lastMatch;
        return this;
    };

    /**
     * Replace the last matched segment with the provided value
     *
     * @param {String} value The new string to replace the matched segment
     * @return The "this" object
     */
    SimpleRegex.prototype.replaceWith = function(value) {
        var startIndex = this._lastIndex + this._replaceLengthDiff,
            endIndex = this._currentIndex + this._replaceLengthDiff;

        this._replacedString = this._replacedString.substr(0, startIndex)
            + value + this._replacedString.substr(endIndex, this._replacedString.length - 1);

        // Update diff value by adding the new length difference
        this._replaceLengthDiff += value.length - (this._currentIndex - this._lastIndex);

        return this;
    };

    /**
     * Getter for the replaced string
     *
     * @return _replacedString
     */
    SimpleRegex.prototype.getReplacedString = function() {
        return this._replacedString;
    };


    SimpleRegex.prototype._updateIndex = function(nextIndex) {
        this._lastIndex = this._currentIndex;
        this._currentIndex = nextIndex;
        this._lastMatch = this._targetString.substr(this._lastIndex,
            this._currentIndex - this._lastIndex);
    };

    return SimpleRegex;
}());
