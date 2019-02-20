"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
var BruleContext;
(function (BruleContext) {
    BruleContext[BruleContext["NA"] = 0] = "NA";
    BruleContext[BruleContext["inArray"] = 1] = "inArray";
    BruleContext[BruleContext["inObject"] = 2] = "inObject";
    BruleContext[BruleContext["inSingle"] = 3] = "inSingle";
})(BruleContext = exports.BruleContext || (exports.BruleContext = {}));
var BruleValType;
(function (BruleValType) {
    BruleValType[BruleValType["String"] = 0] = "String";
    BruleValType[BruleValType["Number"] = 1] = "Number";
    BruleValType[BruleValType["Tobject"] = 2] = "Tobject";
    BruleValType[BruleValType["Array"] = 3] = "Array";
    BruleValType[BruleValType["Undefined"] = 4] = "Undefined";
})(BruleValType = exports.BruleValType || (exports.BruleValType = {}));
exports.commentPropname = "ofo$COMMENT";
exports.bruleValRuleSep = "$#$";
exports.invalidNumber = -999999;
class ObjectFromObject {
    constructor() {
        this._srcobj = {};
        this._brules = {};
        this._tgtobj = {};
    }
    loadBrules(json, jsonfilepath) {
        let jsonstring = "";
        if (json === "") {
            try {
                jsonstring = fs.readFileSync(jsonfilepath, { encoding: "utf8" });
            }
            catch (e) {
                jsonstring = "";
            }
        }
        else {
            jsonstring = json;
        }
        if (jsonstring !== "") {
            try {
                this._brules = JSON.parse(jsonstring);
            }
            catch (_a) {
                this._brules = {};
            }
        }
    }
    loadSourceObject(json, jsonfilepath) {
        let jsonstring = "";
        if (json === "") {
            try {
                jsonstring = fs.readFileSync(jsonfilepath, { encoding: "utf8" });
            }
            catch (e) {
                jsonstring = "";
            }
        }
        else {
            jsonstring = json;
        }
        if (jsonstring !== "") {
            try {
                this._srcobj = JSON.parse(jsonstring);
            }
            catch (_a) {
                this._srcobj = {};
            }
        }
    }
    getTargetObject() {
        return this._tgtobj;
    }
    buildTargetFromSourceByRules() {
        this._tgtobj = this.buildSingleTobjectValue(this._brules, []);
    }
    buildSinglePlainValue(bruleValue, usedArrIdxs) {
        const bruleValueParts = splitBruleValueStr(bruleValue);
        let srcPropValueObj = { asstring: "", asnumber: exports.invalidNumber, asarray: [], propfound: true };
        if (bruleValueParts.srcpropname.indexOf("VALSTR=") === 0 && bruleValueParts.srcpropname.length > 6) {
            srcPropValueObj.asstring = bruleValueParts.srcpropname.substr(7);
            return srcPropValueObj;
        }
        if (bruleValueParts.srcpropname.indexOf("VALNUM=") === 0 && bruleValueParts.srcpropname.length > 6) {
            const valstr = bruleValueParts.srcpropname.substr(7);
            const valnum = Number.parseInt(valstr);
            if (Number.isNaN(valnum)) {
                srcPropValueObj.propfound = false;
                return srcPropValueObj;
            }
            srcPropValueObj.asnumber = valnum;
            return srcPropValueObj;
        }
        srcPropValueObj = this.getSourcePlainValue(bruleValueParts.srcpropname, usedArrIdxs);
        if (bruleValueParts.valueProcRule !== "") {
            // modify the value from the source by the rule
        }
        if (srcPropValueObj.asarray.length > 0) {
            srcPropValueObj.asarray = [];
            srcPropValueObj.propfound = false;
        }
        return srcPropValueObj;
    }
    buildSingleTobjectValue(bruleObject, usedArrIdxs) {
        const builtTobj = {};
        for (const brulePropname of Object.keys(bruleObject)) {
            if (brulePropname.indexOf(exports.commentPropname) > -1) {
                continue;
            }
            const brulePropval = bruleObject[brulePropname];
            const brulePropvalType = this.getBruleValType(brulePropval);
            switch (brulePropvalType) {
                case BruleValType.String:
                    const builtSpValue = this.buildSinglePlainValue(brulePropval, usedArrIdxs);
                    if (builtSpValue.propfound) {
                        if (builtSpValue.asstring !== "") {
                            // @ts-ignore
                            builtTobj[brulePropname] = builtSpValue.asstring;
                        }
                        else if (builtSpValue.asnumber !== exports.invalidNumber) {
                            // @ts-ignore
                            builtTobj[brulePropname] = builtSpValue.asnumber;
                        }
                    }
                    break;
                case BruleValType.Tobject:
                    // @ts-ignore
                    builtTobj[brulePropname] = this.buildSingleTobjectValue(brulePropval, usedArrIdxs);
                    break;
                case BruleValType.Array:
                    const builtArr = Array.from(this.buildSingleArrayValue(brulePropval, usedArrIdxs));
                    // @ts-ignore
                    builtTobj[brulePropname] = builtArr;
                    break;
            }
        }
        return builtTobj;
    }
    buildSingleArrayValue(bruleArrayObject, usedArrIdxs) {
        let builtArray = [];
        if (bruleArrayObject.length < 1) {
            return builtArray;
        }
        const bruleArrayPropval = bruleArrayObject[0];
        const brulePropvalType = this.getBruleValType(bruleArrayPropval);
        switch (brulePropvalType) {
            case BruleValType.String:
                // @ts-ignore
                builtArray = Array.from(this.buildArrayofPlainValues(bruleArrayPropval, usedArrIdxs));
                break;
            case BruleValType.Tobject:
                // @ts-ignore
                builtArray = Array.from(this.buildArrayofTobjectValues(bruleArrayPropval, usedArrIdxs));
                break;
            case BruleValType.Array:
                // currently not supported
                break;
        }
        return builtArray;
    }
    buildArrayofPlainValues(bruleString, usedArrIdxs) {
        let builtArray = [];
        const bruleValueParts = splitBruleValueStr(bruleString);
        let truepropname = bruleValueParts.srcpropname;
        const sqbracketstart = bruleValueParts.srcpropname.indexOf("[]");
        if (sqbracketstart > -1) {
            truepropname = bruleValueParts.srcpropname.substr(0, sqbracketstart);
        }
        const srcPropValueObj = this.getSourcePlainValue(truepropname, usedArrIdxs);
        if (!srcPropValueObj.propfound) {
            return builtArray;
        }
        if (srcPropValueObj.asarray.length > 0) {
            builtArray = srcPropValueObj.asarray;
        }
        else { // push the found single value to the array
            if (srcPropValueObj.asstring !== "") {
                builtArray.push(srcPropValueObj.asstring);
            }
            else if (srcPropValueObj.asnumber !== exports.invalidNumber) {
                builtArray.push((srcPropValueObj.asnumber));
            }
        }
        return builtArray;
    }
    buildArrayofTobjectValues(bruleObject, usedArrIdxs) {
        const builtArray = [];
        let localUsedArrIdxs = [];
        let builtArrayIdx = 0;
        let quitLoop = false;
        let prevSrcPropValueObj = {};
        let prevSrcPropValueObjSize = 0;
        do {
            localUsedArrIdxs = Array.from(usedArrIdxs); // reset to incoming array
            localUsedArrIdxs.push(builtArrayIdx); // push the local index number
            const srcPropValueObj = this.buildSingleTobjectValue(bruleObject, localUsedArrIdxs);
            const srcPropValueObjSize = Object.keys(srcPropValueObj).length;
            if (isEqual(srcPropValueObj, prevSrcPropValueObj)) {
                quitLoop = true;
            }
            else if (srcPropValueObjSize < prevSrcPropValueObjSize) {
                quitLoop = true;
            }
            else if (srcPropValueObj === {}) {
                quitLoop = true;
            }
            if (!quitLoop) {
                builtArray.push(srcPropValueObj);
                prevSrcPropValueObj = srcPropValueObj;
                prevSrcPropValueObjSize = srcPropValueObjSize;
                builtArrayIdx++;
            }
        } while (!quitLoop);
        return builtArray;
    }
    /*
    ***** Source Object methods
     */
    getSourcePlainValue(bruleSourcePropName, usedArrIdx) {
        const retobj = { asstring: "", asnumber: exports.invalidNumber, asarray: [], propfound: true };
        const propnames = bruleSourcePropName.split(".");
        const sopidxs = new Array(); // = source object property value for an index
        propnames.forEach((propname) => {
            const sqbracketstart = propname.indexOf("[");
            if (sqbracketstart > -1) {
                const truepropname = propname.substr(0, sqbracketstart);
                sopidxs.push(truepropname);
                const sqbracketend = propname.indexOf("]");
                const idxval1 = propname.substring(sqbracketstart + 1, sqbracketend);
                const idxval1num = Number.parseInt(idxval1);
                if (Number.isNaN(idxval1num)) {
                    // it is Not a Number - a string?
                    if (typeof idxval1 === "string") {
                        const idxval2 = idxval1.toUpperCase();
                        const idxval2idx = idxval2.charCodeAt(0) - 65; // code(A)=65 -> [0]
                        if (idxval2idx < usedArrIdx.length) {
                            const usedArrIdxVal = usedArrIdx[idxval2idx];
                            sopidxs.push(usedArrIdxVal);
                        }
                        else {
                            console.log("*** ERROR in ofo.getSourceValue: number of values in usedArrIdx TOO LOW!");
                        }
                    }
                }
                else { // it is a number
                    sopidxs.push(idxval1num);
                }
            }
            else {
                sopidxs.push(propname);
            }
        });
        let retval = null;
        switch (sopidxs.length) {
            case 1:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 2:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 3:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 4:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 5:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 6:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 7:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]][sopidxs[6]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 8:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]][sopidxs[6]][sopidxs[7]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 9:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]][sopidxs[6]][sopidxs[7]][sopidxs[8]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 10:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]][sopidxs[6]][sopidxs[7]][sopidxs[8]][sopidxs[9]];
                }
                catch (e) {
                    retobj.propfound = false;
                }
                break;
            default:
                retobj.propfound = false;
                break;
        }
        if (retobj.propfound) {
            if (Array.isArray(retval)) {
                retobj.asarray = retval;
            }
            else if (typeof retval === "string") {
                retobj.asstring = retval;
            }
            else if (typeof retval === "number") {
                retobj.asnumber = retval;
            }
        }
        return retobj;
    }
    /*
    ***** GENERIC METHODS
     */
    /**
     * Detects the type of the JS (any-)object
     * Returns one of the BruleValTypes.
     * @param brvalue
     */
    getBruleValType(brvalue) {
        let rettype = BruleValType.Undefined;
        if (Array.isArray(brvalue)) {
            rettype = BruleValType.Array;
        }
        else if (typeof brvalue === "string") {
            rettype = BruleValType.String;
        }
        else if (typeof brvalue === "number") {
            rettype = BruleValType.Number;
        }
        else if ((typeof brvalue === "object") && (brvalue !== null)) {
            rettype = BruleValType.Tobject;
        }
        return rettype;
    }
    /*
    ***** TEST methods during development
     */
    tEST01() {
        let testUsedArrIdx = [1, 2, 3];
        let fullpropname = "";
        let testValue = {};
        /*
        fullpropname = "sh1plainSingle";
        testValue = this.getSourcePlainValue(fullpropname, testUsedArrIdx);
        console.log("Result of getSourceValue Test 1")
        console.log(testValue);
        fullpropname = "nested01.nested01A2[1]";
        testValue = this.getSourcePlainValue(fullpropname, testUsedArrIdx);
        console.log("Result of getSourceValue Test 2")
        console.log(testValue);
        fullpropname = "nested01.nested01A2[a]";
        testValue = this.getSourcePlainValue(fullpropname, testUsedArrIdx);
        console.log("Result of getSourceValue Test 3")
        console.log(testValue);
        fullpropname = "nested01.nested01A4[0].nested01A4B1a";
        testValue = this.getSourcePlainValue(fullpropname, testUsedArrIdx);
        console.log("Result of getSourceValue Test 4")
        console.log(testValue);
        fullpropname = "nested01.nested01A4[b].nested01A4B1a";
        testValue = this.getSourcePlainValue(fullpropname, testUsedArrIdx);
        console.log("Result of getSourceValue Test 5")
        console.log(testValue);
*/
        fullpropname = "sh1plainArray";
        testValue = this.getSourcePlainValue(fullpropname, testUsedArrIdx);
        console.log("Result of getSourceValue Test 6");
        console.log(testValue);
    }
}
exports.ObjectFromObject = ObjectFromObject;
function splitBruleValueStr(valuestr) {
    const retobj = { srcpropname: "", valueProcRule: "" };
    const strparts = valuestr.split(exports.bruleValRuleSep);
    retobj.srcpropname = strparts[0];
    if (strparts.length > 1) {
        retobj.valueProcRule = strparts[1];
    }
    return retobj;
}
// isEqual function taken from: https://gomakethings.com/check-if-two-arrays-or-objects-are-equal-with-javascript/
function isEqual(value1, value2) {
    // Get the value type
    const type = Object.prototype.toString.call(value1);
    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(value2)) {
        return false;
    }
    // If items are not an object or array, return false
    if (["[object Array]", "[object Object]"].indexOf(type) < 0) {
        return false;
    }
    // Compare the length of the length of the two items
    const valueLen = type === "[object Array]" ? value1.length : Object.keys(value1).length;
    const otherLen = type === "[object Array]" ? value2.length : Object.keys(value2).length;
    if (valueLen !== otherLen) {
        return false;
    }
    // Compare two items
    const compare = (item1, item2) => {
        // Get the object type
        const itemType = Object.prototype.toString.call(item1);
        // If an object or array, compare recursively
        if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
            if (!isEqual(item1, item2)) {
                return false;
            }
        }
        else {
            // If the two items are not the same type, return false
            if (itemType !== Object.prototype.toString.call(item2)) {
                return false;
            }
            // Else if it's a function, convert to a string and compare
            // Otherwise, just compare
            if (itemType === "[object Function]") {
                if (item1.toString() !== item2.toString()) {
                    return false;
                }
            }
            else {
                if (item1 !== item2) {
                    return false;
                }
            }
        }
    };
    // Compare properties
    if (type === "[object Array]") {
        for (let i = 0; i < valueLen; i++) {
            if (compare(value1[i], value2[i]) === false) {
                return false;
            }
        }
    }
    else {
        for (const key in value1) {
            if (value1.hasOwnProperty(key)) {
                if (compare(value1[key], value2[key]) === false) {
                    return false;
                }
            }
        }
    }
    // If nothing failed, return true
    return true;
}
//# sourceMappingURL=index.js.map