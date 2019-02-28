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
        let retValue = true;
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
        if (Object.keys(this._brules).length === 0 && this._brules.constructor === Object) {
            retValue = false;
        }
        return retValue;
    }
    loadSourceObject(json, jsonfilepath) {
        let retValue = true;
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
        if (Object.keys(this._srcobj).length === 0 && this._srcobj.constructor === Object) {
            retValue = false;
        }
        return retValue;
    }
    getTargetObject() {
        return this._tgtobj;
    }
    buildTargetFromSourceByRules() {
        this._tgtobj = this.buildSingleTobjectValue(this._brules, []);
    }
    buildSingleValue(bruleValue, usedArrIdxs) {
        const bruleValueParts = splitBruleValueStr(bruleValue);
        const srcPropValueObj1 = { asstring: "", asnumber: exports.invalidNumber, asobject: {}, asarray: [], propfound: true };
        if (bruleValueParts.srcpropname.indexOf("VALSTR=") === 0 && bruleValueParts.srcpropname.length > 6) {
            srcPropValueObj1.asstring = bruleValueParts.srcpropname.substr(7);
            return srcPropValueObj1;
        }
        if (bruleValueParts.srcpropname.indexOf("VALNUM=") === 0 && bruleValueParts.srcpropname.length > 6) {
            const valstr = bruleValueParts.srcpropname.substr(7);
            const valnum = Number.parseInt(valstr, 10);
            if (Number.isNaN(valnum)) {
                srcPropValueObj1.propfound = false;
                return srcPropValueObj1;
            }
            srcPropValueObj1.asnumber = valnum;
            return srcPropValueObj1;
        }
        const srcPropValueObj2 = this.getSourceSingleValue(bruleValueParts.srcpropname, usedArrIdxs);
        if (bruleValueParts.valueProcRule !== "") {
            // modify the value from the source by the rule
            const valueProcRule = bruleValueParts.valueProcRule.toUpperCase();
            switch (valueProcRule) {
                case "TOSTR":
                    if (srcPropValueObj2.asstring === "") {
                        srcPropValueObj2.asstring = srcPropValueObj2.asnumber.toString(10);
                        srcPropValueObj2.asnumber = exports.invalidNumber;
                    }
                    break;
                case "TONUM":
                    if ((srcPropValueObj2.asnumber === exports.invalidNumber) && (srcPropValueObj2.asstring !== "")) {
                        const valnumber = Number.parseInt(srcPropValueObj2.asstring, 10);
                        if (!Number.isNaN(valnumber)) {
                            srcPropValueObj2.asnumber = valnumber;
                            srcPropValueObj2.asstring = "";
                        }
                        else {
                            srcPropValueObj2.asnumber = exports.invalidNumber;
                        }
                    }
                    break;
            }
        }
        if (srcPropValueObj2.asarray.length > 0) {
            srcPropValueObj2.asarray = [];
            srcPropValueObj2.propfound = false;
        }
        return srcPropValueObj2;
    }
    buildSingleTobjectValue(bruleObject, usedArrIdxs) {
        const builtTobj = {};
        for (const brulePropname of Object.keys(bruleObject)) {
            if (brulePropname.indexOf(exports.commentPropname) > -1) {
                continue;
            }
            const brulePropval = bruleObject[brulePropname];
            const brulePropvalType = ObjectFromObject.getBruleValType(brulePropval);
            switch (brulePropvalType) {
                case BruleValType.String:
                    const builtSpValue = this.buildSingleValue(brulePropval, usedArrIdxs);
                    if (builtSpValue.propfound) {
                        if (builtSpValue.asstring !== "") {
                            // @ts-ignore
                            builtTobj[brulePropname] = builtSpValue.asstring;
                        }
                        else if (builtSpValue.asnumber !== exports.invalidNumber) {
                            // @ts-ignore
                            builtTobj[brulePropname] = builtSpValue.asnumber;
                        }
                        else if (builtSpValue.asobject !== {}) {
                            // @ts-ignore
                            builtTobj[brulePropname] = builtSpValue.asobject;
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
        const brulePropvalType = ObjectFromObject.getBruleValType(bruleArrayPropval);
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
        const srcPropValueObj = this.getSourceSingleValue(truepropname, usedArrIdxs);
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
    getSourceSingleValue(bruleSourcePropName, usedArrIdx) {
        const retobj = { asstring: "", asnumber: exports.invalidNumber, asobject: {}, asarray: [], propfound: true };
        const propnames = bruleSourcePropName.split(".");
        const sopidxs = []; // = source object property value for an index
        propnames.forEach((propname) => {
            const sqbracketstart = propname.indexOf("[");
            if (sqbracketstart > -1) {
                const truepropname = propname.substr(0, sqbracketstart);
                sopidxs.push(truepropname);
                const sqbracketend = propname.indexOf("]");
                const idxval1 = propname.substring(sqbracketstart + 1, sqbracketend);
                const idxval1num = Number.parseInt(idxval1, 10);
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
            else if ((typeof retval === "object") && (retval !== null)) {
                retobj.asobject = retval;
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
    static getBruleValType(brvalue) {
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