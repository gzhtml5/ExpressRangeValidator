/**
 *  expressRangeValidator.js v1.0.0
 *  A library of digital express range validator.
 *  Copyright (c) 2022 Jonah Shun <JonahShun@gmail.com>
 *  https://github.com/gzhtml5
 */
;(function(window, exportName) {
    'use strict';
    /**
     * 
     * @param { 'X>10' } rangeExpress 
     * @param { 90 } value 
     * @param { special: [['≥', '>=']] } options 
     */
    function ExpressRangeValidator(rangeExpress, value, options) {
        var gInputExpress = rangeExpress;
        var gInputValue = value;
        var gMatchResult = null;
        var matchPattern = null;
        /** runResult: false means don't pass validation; true means pass validation */
        var runResult = false;
    
        /** runResultCode: 0 validation is success; 1 validation is fail; 2 can't recognize the relationship base on your input express, such as "10<x,11<x" */
        var runResultCode = 0;
        options = undefined === options? {}: options;
        var settings = {
            special: options.special || [],
            toX: options.toX || false,
        }

        var validator = {
            /**
             * list all patterns
             */
            getPatternList: function () {
                var that = this;
                var numRegex = '(-?[0-9]*([.][0-9]+)?)';
                var symbolRegex = '(<|<=|>|>=|≤|≥|\!=|=)';
                // "\u4e00-\u9fa5" support Chinese
                var elementStr = '[\u4e00-\u9fa5_a-zA-Z0-9]+';
                var xVariable = gInputValue;
                return [
                    { // gMatchResult: ['x>90','x','>','90',undefined,index:0,input:'x>90', groups:undefined]
                        pattern: 'x#N',
                        regex: new RegExp('^(x|X)' + symbolRegex + numRegex + '$'),
                        run: function () {
                            var rResult = that.exeRelation(xVariable, gMatchResult[2], gMatchResult[3]);
                            runResultCode = rResult? 0: 1;
                            return rResult;
                        }
                    },
                    { // gMatchResult: ['90<x','90',undefined,'<','x',index:0,input:'90<x',groups:undefined]
                        pattern: 'N#x',
                        regex: new RegExp('^' + numRegex + symbolRegex + '(x|X)$'),
                        run: function () {
                            var rResult = that.exeRelation(gMatchResult[1], gMatchResult[3], xVariable);
                            runResultCode = rResult? 0: 1;
                            return rResult;
                        }
                    },
                    { // gMatchResult: ['90.5>x>1', '90.5', '.5', '>', 'x', '>', '1', undefined, index: 0, input: '90.5>x>1', groups: undefined]
                        pattern: 'N#x#M',
                        regex: new RegExp('^' + numRegex + symbolRegex + '(x|X)' + symbolRegex + numRegex + '$'),
                        run: function () {
                            var logicRelation = that.xInTheMiddle(gMatchResult[3], gMatchResult[5], gMatchResult[1], gMatchResult[6]);
                            if (!logicRelation) {
                                runResultCode = 2;
                                return false;
                            }
 
                            var rResult = (that.exeRelation(gMatchResult[1], gMatchResult[3], xVariable) && that.exeRelation(xVariable, gMatchResult[5], gMatchResult[6]));
                            runResultCode = rResult? 0: 1;
                            return rResult;
                        }
                    },
                    { // gMatchResult: ['10~100','10',undefined,'~','100',undefined,index:0,input:'10~100',groups:undefined]
                        pattern: 'N~M',
                        regex: new RegExp('^' + numRegex + '(~)' + numRegex + '$'),
                        run: function () {
                            var rResult = (that.exeRelation(gMatchResult[1], '<=', xVariable) && that.exeRelation(xVariable, '<=', gMatchResult[4]));
                            runResultCode = rResult? 0: 1;
                            return rResult;
                        }
                    },
                    {// gMatchResult: ['[N,M,O,P]','N,M,O,P','O,',index:0,input:'[N,M,O,P]',groups:undefined]
                        pattern: '[N,M,O]',
                        regex: new RegExp('^\\[((' + elementStr + '[,])*' + elementStr + ')+\\]$'),
                        run: function () {
                            var rResult = that.inArr(xVariable, gMatchResult[1]);
                            runResultCode = rResult? 0: 1;
                            return rResult;
                        }
                    },
                    {// gMatchResult: ['X<10.000001,x>20', 'X', '<', '10.000001', '.000001', ',', 'x', '>', '20', undefined, index: 0, input: 'X<10.000001,x>20', groups: undefined]
                        pattern: 'x#N,x#M',
                        regex: new RegExp('^' + '(x|X)' + symbolRegex + numRegex + '(,)' + '(x|X)' + symbolRegex + numRegex + '$'),
                        run: function () {
                            var logicRelation = that.figureRelationship(this.pattern, gMatchResult[2], gMatchResult[7], gMatchResult[3], gMatchResult[8]);
                            if (!logicRelation) {
                                runResultCode = 2;
                                return false;
                            }
                            var leftResult = that.exeRelation(xVariable, gMatchResult[2], gMatchResult[3]);
                            var rightResult = that.exeRelation(xVariable, gMatchResult[7], gMatchResult[8]);
                            return that.returnResult(leftResult, logicRelation, rightResult);
                        }
                    },
                    { // gMatchResult: ['10.000001>x,20<=x', '10.000001', '.000001', '>', 'x', ',', '20', undefined, '<=', 'x', index: 0, input: '10.000001>x,20<=x', groups: undefined]
                        pattern: 'N#x,M#x',
                        regex: new RegExp('^' + numRegex + symbolRegex + '(x|X)' + '(,)' + numRegex + symbolRegex + '(x|X)' + '$'),
                        run: function () {
                            var logicRelation = that.figureRelationship(this.pattern, gMatchResult[3], gMatchResult[8], gMatchResult[1], gMatchResult[6]);
                            if (!logicRelation) {
                                runResultCode = 2;
                                return false;
                            }
                            var leftResult = that.exeRelation(gMatchResult[1], gMatchResult[3], xVariable);
                            var rightResult = that.exeRelation(gMatchResult[6], gMatchResult[8], xVariable);
                            return that.returnResult(leftResult, logicRelation, rightResult);
                        }
                    },
                    { // gMatchResult: ["70.5<x,x<90", "70.5", ".5", "<", "x", ",", "x", "<", "90", undefined, index: 0, input: "70.5<x,x<90", groups: undefined]
                        pattern: 'N#x,x#M',
                        regex: new RegExp('^' + numRegex + symbolRegex + '(x|X)' + '(,)' + '(x|X)' + symbolRegex + numRegex + '$'),
                        run: function () {
                            var logicRelation = that.figureRelationship(this.pattern, gMatchResult[3], gMatchResult[7], gMatchResult[1], gMatchResult[8]);
                            if (!logicRelation) {
                                runResultCode = 2;
                                return false;
                            }
                            var leftResult = that.exeRelation(gMatchResult[1], gMatchResult[3], xVariable);
                            var rightResult = that.exeRelation(xVariable, gMatchResult[7], gMatchResult[8]);
                            return that.returnResult(leftResult, logicRelation, rightResult);
                        }
                    },
                    { // gMatchResult: ['x<=90,100<x','x','<=','90',undefined,',','100',undefined,'<','x',index:0,input:'x<=90,100<x',groups:undefined]
                        pattern: 'x#N,M#x',
                        regex: new RegExp('^' + '(x|X)' + symbolRegex + numRegex + '(,)' + numRegex + symbolRegex + '(x|X)' + '$'),
                        run: function () {
                            var logicRelation = that.figureRelationship(this.pattern, gMatchResult[2], gMatchResult[8], gMatchResult[3], gMatchResult[6]);
                            if (!logicRelation) {
                                runResultCode = 2;
                                return false;
                            }
                            var leftResult = that.exeRelation(xVariable, gMatchResult[2], gMatchResult[3]);
                            var rightResult = that.exeRelation(gMatchResult[6], gMatchResult[8], xVariable);
                            return that.returnResult(leftResult, logicRelation, rightResult);
                        }
                    }
                ];
            },
    
            /**
             * figure the return result
             * @param {*} leftResult 
             * @param {*} logicRelation 
             * @param {*} rightResult 
             */
            returnResult: function(leftResult, logicRelation, rightResult) {
                var rResult = true;
                if ('or' == logicRelation) {
                    rResult = (leftResult || rightResult);
                } else {
                    rResult = (leftResult && rightResult);
                }
                runResultCode = rResult? 0: 1;
                return rResult;
            },
    
            /**
             * find out the pattern from getPatternList base on gInputExpress
             */
            findPattern: function () {
                var formulaExpress = this.replaceSymbol(gInputExpress);
                if (settings.toX) {
                    formulaExpress = this.replaceVariable(formulaExpress);
                }
                var pList = this.getPatternList();
                matchPattern = pList.find(function(pItem) {
                    var regexStr = pItem.regex;
                    regexStr.lastIndex = 0;
                    gMatchResult = regexStr.exec(formulaExpress);
                    return null != gMatchResult;
                })
                return matchPattern;
            },
            /**
             * for enum express
             * @param {*} val 
             * @param {*} arrValStr 
             */
            inArr: function (val, arrValStr) {
                if ('' == arrValStr || null == arrValStr) {
                    return null;
                }
                var eleArr = arrValStr.split(',');
                val = val + '';
                if (eleArr.includes(val)) {
                    return true;
                } else {
                    return false;
                }
            },
            /**
             * execuse relation between "a" and "b".
             * pass a relation symbol and two values into this function
             * @param {*} a 
             * @param {*} symbol 
             * @param {*} b 
             */
            exeRelation: function(a, symbol, b) {
                var result = null;
                a = a * 1;
                b = b * 1;
                switch (symbol) {
                    case '>':
                        result = (a > b);
                        break;
                    case '>=':
                        result = (a >= b);
                        break;
                    case '<':
                        result = (a < b);
                        break;
                    case '<=':
                        result = (a <= b);
                        break;
                    case '!=':
                        result = (a != b);
                        break;
                    case '=':
                        result = (a == b);
                        break;
                    default:
                        break;
                }
        
                return result;
            },
            /**
             * replace special symbols.
             * settings.special is from options
             * @param {*} inputExpress 
             */
            replaceSymbol: function (inputExpress) {
                inputExpress = inputExpress.replace(/\s+/g, '');
                let specials = settings.special;
                for(var i = 0, len = specials.length; i < len; i++) {
                    var regStr = new RegExp(specials[i][0], "g");
                    regStr.lastIndex = 0;
                    inputExpress = inputExpress.replace(regStr, specials[i][1]);
                }
                // replace symbol ";" with ","
                inputExpress = inputExpress.replace(/;/g, ',');
    
                return inputExpress;
            },
            /**
             * if the express like "pa>1.001", we can use this function convert is to "X>1.001"
             * variable "pa" be replaced with "X" 
             * @param {*} xVar
             */
            replaceVariable: function (xVar) {
                xVar = xVar.replace(/[a-z|A-Z]+/g, 'X');
                return xVar;
            },
            /**
             * If the pattern has two parts and commbine with comma in the middle, such as "A#B,A#B".
             * There are four kinds of situations in this pattern "A#B,A#B".
             * We need to spilt it with "," and make sure which relationship the two side use
             * The relationship can be just logic "and" , "or" and false
             * @param {*} pattern
             * @param {*} leftSymbol
             * @param {*} rightSymbol
             * @param {*} nValue
             * @param {*} mValue
             */
            figureRelationship: function(pattern, leftSymbol, rightSymbol, nValue, mValue) {
                var that = this;
                nValue = nValue * 1;
                mValue = mValue * 1;
                if (nValue == mValue) {
                    return false;
                }
                var status = !!(nValue > mValue);
                var relationResult = '';
                switch (pattern) {
                    case 'x#N,x#M':
                        relationResult = that.variablesInSameSide(leftSymbol, rightSymbol, 'L', status);
                        break;
                    case 'N#x,M#x':
                        relationResult = that.variablesInSameSide(leftSymbol, rightSymbol, 'R', !status);
                        break;
                    case 'N#x,x#M':
                        relationResult = that.variablesInDifferentSide(leftSymbol, rightSymbol, !status);
                        break;
                    case 'x#N,M#x':
                        relationResult = that.variablesInDifferentSide(leftSymbol, rightSymbol, status);
                        break;
                    default:
                        relationResult = false;
                        break;
                }
                return relationResult;
            },
    
            /**
             * x#N,x#M
             * N#x,M#x
             * the pattern be split into two parts, and we found all "x" variables can be in left/right side of "#" symbol.
             * this function is to decide what's the relationship between left part and right part
             * @param {*} leftSymbol
             * @param {*} rightSymbol
             * @param {*} status
             */
            variablesInSameSide: function(leftSymbol, rightSymbol, varSide, status) {
                var logicRelation = false;
                if (('<' == leftSymbol || '<=' == leftSymbol) && ('>' == rightSymbol || '>=' == rightSymbol) && !status) {
                    logicRelation = 'or';
                } else if (('>' == leftSymbol || '>=' == leftSymbol) && ('<' == rightSymbol || '<=' == rightSymbol) && status) {
                    logicRelation = 'or';
                } else if (('<' == leftSymbol || '<=' == leftSymbol) && ('>' == rightSymbol || '>=' == rightSymbol) && status) {
                    logicRelation = 'and';
                } else if (('>' == leftSymbol || '>=' == leftSymbol) && ('<' == rightSymbol || '<=' == rightSymbol) && !status) {
                    logicRelation = 'and';
                } else if ('=' == leftSymbol && '=' == rightSymbol && 'L' == varSide) {
                    logicRelation = 'or';
                }
                return logicRelation;
            },
    
            /**
             * x#N,M#x
             * N#x,x#M
             * the pattern be split into two parts. 
             * the "x" variable be in left side of "#" for first part, other "x" variable in right side of "#" for second part
             * or the the "x" variable be in right side of "#" for first part, other "x" variable in left side of "#" for second part
             * this function is to decide the relationship between two divided parts
             * @param {*} leftSymbol
             * @param {*} rightSymbol
             * @param {*} status
             */
            variablesInDifferentSide: function(leftSymbol, rightSymbol, status) {
                var logicRelation = false;
                if (('<' == leftSymbol || '<=' == leftSymbol) && ('<' == rightSymbol || '<=' == rightSymbol) && status) {
                    logicRelation = 'and';
                } else if (('>' == leftSymbol || '>=' == leftSymbol) && ('>' == rightSymbol || '>=' == rightSymbol) && !status) {
                    logicRelation = 'and';
                } else if (('<' == leftSymbol || '<=' == leftSymbol) && ('<' == rightSymbol || '<=' == rightSymbol) && !status) {
                    logicRelation = 'or';
                } else if (('>' == leftSymbol || '>=' == leftSymbol) && ('>' == rightSymbol || '>=' == rightSymbol) && status) {
                    logicRelation = 'or';
                }
                return logicRelation;
            },
    
            /**
             * 
             * @param {*} leftSymbol 
             * @param {*} rightSymbol 
             * @param {*} nValue 
             * @param {*} mValue 
             */
            xInTheMiddle: function(leftSymbol, rightSymbol, nValue, mValue) {
                var logicRelation = false;
                nValue = nValue * 1;
                mValue = mValue * 1;
                if (('<' == leftSymbol || '<=' == leftSymbol) && ('<' == rightSymbol || '<=' == rightSymbol) && nValue < mValue) {
                    logicRelation = 'and';
                } else if (('>' == leftSymbol || '>=' == leftSymbol) && ('>' == rightSymbol || '>=' == rightSymbol) && nValue > mValue) {
                    logicRelation = 'and';
                } else {
                    logicRelation = false;
                }
                return logicRelation;
            },
    
        }
        validator.findPattern();
        if (null != matchPattern) {
            runResult =  matchPattern.run();
        }
    
        // public functions and variables
        var returnObj = {
            runResult: runResult,
            runResultCode: runResultCode
        }
        return returnObj;
    }

    if (typeof define === 'function' && define.amd) {
        define(function() {
            return ExpressRangeValidator;
        });
    } else if (typeof module != 'undefined' && module.exports) {
        module.exports = ExpressRangeValidator;
    } else {
        window[exportName] = ExpressRangeValidator;
    }

})('undefined' !== typeof window ? window : {}, 'ExpressRangeValidator');