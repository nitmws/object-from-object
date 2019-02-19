import * as fs from "fs";

export enum BruleContext { NA, inArray, inObject, inSingle }

export enum BruleValType { String, Number, Tobject, Array, Undefined}

export const commentPropname = "ofo$COMMENT";

export const bruleValRuleSep = "$#$";

export const invalidNumber = -999999;

interface IPlainValueOptArray {
    asstring: string;
    asnumber: number;
    asarray: any[];
    propfound: boolean;
}

export class ObjectFromObject {
    protected _srcobj: object;
    protected _brules: object;
    protected _tgtobj: object;

    constructor() {
        this._srcobj = {};
        this._brules = {};
        this._tgtobj = {};
    }

    public loadRules(json: string, jsonfilepath: string ) {
        let jsonstring: string = "";
        if (json === "") {
            try {
                jsonstring = fs.readFileSync(jsonfilepath, { encoding: "utf8"} );
            } catch (e) {
                jsonstring = "";
            }
        } else {
            jsonstring = json;
        }
        if (jsonstring !== "") {
            try {
                this._brules = JSON.parse(jsonstring);
            } catch {
                this._brules = {};
            }
        }
    }

    public loadSourceObject( json: string, jsonfilepath: string ) {
        let jsonstring: string = "";
        if (json === "") {
            try {
                jsonstring = fs.readFileSync(jsonfilepath, { encoding: "utf8"} );
            } catch (e) {
                jsonstring = "";
            }
        } else {
            jsonstring = json;
        }
        if (jsonstring !== "") {
            try {
                this._srcobj = JSON.parse(jsonstring);
            } catch {
                this._srcobj = {};
            }
        }
    }

    public getTargetObject(): object {
        return this._tgtobj;
    }

    public buildTargetFromSourceByRules(): void {
        this._tgtobj = this.buildSingleTobjectValue(this._brules, []);
    }

    private  buildSinglePlainValue(bruleValue: string, usedArrIdxs: number[]): IPlainValueOptArray {
        const bruleValueParts: IBruleValueParts = splitBruleValueStr(bruleValue);
        let srcPropValueObj: IPlainValueOptArray = { asstring: "", asnumber: invalidNumber, asarray: [], propfound: true };
        if (bruleValueParts.srcpropname.indexOf("VALSTR=") === 0 && bruleValueParts.srcpropname.length > 6 ) {
            srcPropValueObj.asstring =  bruleValueParts.srcpropname.substr(7);
            return srcPropValueObj;
        }
        if (bruleValueParts.srcpropname.indexOf("VALNUM=") === 0 && bruleValueParts.srcpropname.length > 6 ) {
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
    private buildSingleTobjectValue(bruleObject: any, usedArrIdxs: number[]): object {
        const builtTobj: object = {};
        for (const brulePropname of Object.keys(bruleObject)) {
            if (brulePropname.indexOf(commentPropname) > -1) {
                continue;
            }
            const brulePropval: any = bruleObject[brulePropname];
            const brulePropvalType: BruleValType = this.getBruleValType(brulePropval);
            switch (brulePropvalType) {
                case BruleValType.String:
                    const builtSpValue: IPlainValueOptArray = this.buildSinglePlainValue(brulePropval, usedArrIdxs);
                    if (builtSpValue.propfound) {
                        if (builtSpValue.asstring !== "") {
                            // @ts-ignore
                            builtTobj[brulePropname] = builtSpValue.asstring;
                        } else if (builtSpValue.asnumber !== invalidNumber) {
                            // @ts-ignore
                            builtTobj[brulePropname] = builtSpValue.asnumber;
                        }
                    }
                    break;
                case BruleValType.Tobject:
                    // @ts-ignore
                    builtTobj[brulePropname] = this.buildSingleTobjectValue(brulePropval as object, usedArrIdxs);
                    break;
                case BruleValType.Array:
                    const builtArr: any[] = Array.from(this.buildSingleArrayValue(brulePropval, usedArrIdxs));
                    // @ts-ignore
                    builtTobj[brulePropname] = builtArr;
                    break;
            }
        }
        return builtTobj;
    }
    private buildSingleArrayValue(bruleArrayObject: any[], usedArrIdxs: number[]): any[]  {
        let builtArray: any[] = [];
        if (bruleArrayObject.length < 1) {
            return builtArray;
        }
        const bruleArrayPropval: any = bruleArrayObject[0];
        const brulePropvalType: BruleValType = this.getBruleValType(bruleArrayPropval);
        switch (brulePropvalType) {
            case BruleValType.String:
                // @ts-ignore
                builtArray = Array.from(this.buildArrayofPlainValues(bruleArrayPropval as string, usedArrIdxs));
                break;
            case BruleValType.Tobject:
                // @ts-ignore
                builtArray = Array.from(this.buildArrayofTobjectValues(bruleArrayPropval as object, usedArrIdxs));
                break;
            case BruleValType.Array:
                // currently not supported
                break;
        }
        return builtArray;
    }
    private buildArrayofPlainValues(bruleString: string, usedArrIdxs: number[]): string[]  {
        let builtArray: any[] = [];
        const bruleValueParts: IBruleValueParts = splitBruleValueStr(bruleString);
        let truepropname: string = bruleValueParts.srcpropname;
        const sqbracketstart = bruleValueParts.srcpropname.indexOf("[]");
        if ( sqbracketstart > -1) {
            truepropname = bruleValueParts.srcpropname.substr(0, sqbracketstart);
        }
        const srcPropValueObj = this.getSourcePlainValue(truepropname, usedArrIdxs);
        if (!srcPropValueObj.propfound) {
            return builtArray;
        }
        if (srcPropValueObj.asarray.length > 0) {
            builtArray = srcPropValueObj.asarray;
        } else { // push the found single value to the array
            if (srcPropValueObj.asstring !== "") {
                builtArray.push(srcPropValueObj.asstring);
            } else if (srcPropValueObj.asnumber !== invalidNumber) {
                builtArray.push((srcPropValueObj.asnumber));
            }
        }
        return builtArray;
    }
    private buildArrayofTobjectValues(bruleObject: object, usedArrIdxs: number[]): object[]  {
        const builtArray: object[] = [];
        let localUsedArrIdxs: number[] = [];
        let builtArrayIdx = 0;
        let quitLoop: boolean = false;
        let prevSrcPropValueObj: any = {};
        let prevSrcPropValueObjSize: number = 0;
        do {
            localUsedArrIdxs = Array.from(usedArrIdxs); // reset to incoming array
            localUsedArrIdxs.push(builtArrayIdx); // push the local index number
            const srcPropValueObj = this.buildSingleTobjectValue(bruleObject, localUsedArrIdxs);
            const srcPropValueObjSize = Object.keys(srcPropValueObj).length;
            if (isEqual(srcPropValueObj, prevSrcPropValueObj)) {
                quitLoop = true;
            } else if ( srcPropValueObjSize < prevSrcPropValueObjSize) {
                quitLoop = true;
            } else if (srcPropValueObj === {}) {
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
    private getSourcePlainValue(bruleSourcePropName: string, usedArrIdx: number[]): IPlainValueOptArray  {
        const retobj: IPlainValueOptArray = { asstring: "", asnumber: invalidNumber, asarray: [], propfound: true };
        const propnames: string[] = bruleSourcePropName.split(".");
        const sopidxs: any[] = new Array(); // = source object property value for an index
        propnames.forEach( (propname: string) => {
            const sqbracketstart = propname.indexOf("[");
            if (sqbracketstart > -1) {
                const truepropname: string = propname.substr(0, sqbracketstart);
                sopidxs.push(truepropname);
                const sqbracketend = propname.indexOf("]");
                const idxval1: any = propname.substring(sqbracketstart + 1, sqbracketend);
                const idxval1num = Number.parseInt(idxval1);
                if (Number.isNaN(idxval1num)) {
                    // it is Not a Number - a string?
                    if (typeof idxval1 === "string") {
                        const idxval2: string = idxval1.toUpperCase() as string;
                        const idxval2idx: number = idxval2.charCodeAt(0) - 65; // code(A)=65 -> [0]
                        if (idxval2idx < usedArrIdx.length) {
                            const usedArrIdxVal = usedArrIdx[idxval2idx];
                            sopidxs.push(usedArrIdxVal);
                        } else {
                            console.log("*** ERROR in ofo.getSourceValue: number of values in usedArrIdx TOO LOW!");
                        }
                    }
                } else { // it is a number
                    sopidxs.push(idxval1num);
                }
            } else {
                sopidxs.push(propname);
            }
        });
        let retval: any = null;
        switch (sopidxs.length) {
            case 1:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]];
                } catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 2:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]];
                } catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 3:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]];
                } catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 4:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]];
                } catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 5:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]];
                } catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 6:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]];
                } catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 7:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]][sopidxs[6]];
                } catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 8:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]][sopidxs[6]][sopidxs[7]];
                } catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 9:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]][sopidxs[6]][sopidxs[7]][sopidxs[8]];
                } catch (e) {
                    retobj.propfound = false;
                }
                break;
            case 10:
                try {
                    // @ts-ignore
                    retval = this._srcobj[sopidxs[0]][sopidxs[1]][sopidxs[2]][sopidxs[3]][sopidxs[4]][sopidxs[5]][sopidxs[6]][sopidxs[7]][sopidxs[8]][sopidxs[9]];
                } catch (e) {
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
            } else if (typeof retval === "string") {
                retobj.asstring = retval;
            } else if (typeof retval === "number") {
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
    private getBruleValType(brvalue: object): BruleValType {
        let rettype: BruleValType = BruleValType.Undefined;
        if (Array.isArray(brvalue)) {
            rettype = BruleValType.Array;
        } else if (typeof brvalue === "string") {
            rettype = BruleValType.String;
        } else if (typeof brvalue === "number") {
            rettype = BruleValType.Number;
        } else if ((typeof brvalue === "object") && (brvalue !== null)) {
            rettype = BruleValType.Tobject;
        }
        return rettype;
    }

    /*
    ***** TEST methods during development
     */
    public tEST01() {
        let testUsedArrIdx = [1, 2, 3];
        let fullpropname: string = "";
        let testValue: object = {};
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

/*
***** Generic Helper functions
 */

interface IBruleValueParts {
    srcpropname: string;
    valueProcRule: string;
}
function splitBruleValueStr(valuestr: string): IBruleValueParts {
    const retobj = { srcpropname: "", valueProcRule: ""};
    const strparts = valuestr.split(bruleValRuleSep);
    retobj.srcpropname = strparts[0];
    if (strparts.length > 1) {
        retobj.valueProcRule = strparts[1];
    }
    return retobj;
}

// isEqual function taken from: https://gomakethings.com/check-if-two-arrays-or-objects-are-equal-with-javascript/
function isEqual(value1: any, value2: any): boolean {

    // Get the value type
    const type = Object.prototype.toString.call(value1);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(value2)) { return false; }

    // If items are not an object or array, return false
    if (["[object Array]", "[object Object]"].indexOf(type) < 0) { return false; }

    // Compare the length of the length of the two items
    const valueLen = type === "[object Array]" ? value1.length : Object.keys(value1).length;
    const otherLen = type === "[object Array]" ? value2.length : Object.keys(value2).length;
    if (valueLen !== otherLen) { return false; }

    // Compare two items
    const compare = (item1: any, item2: any) => {

        // Get the object type
        const itemType = Object.prototype.toString.call(item1);

        // If an object or array, compare recursively
        if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
            if (!isEqual(item1, item2)) { return false; }
        } else {
            // If the two items are not the same type, return false
            if (itemType !== Object.prototype.toString.call(item2)) { return false; }

            // Else if it's a function, convert to a string and compare
            // Otherwise, just compare
            if (itemType === "[object Function]") {
                if (item1.toString() !== item2.toString()) { return false; }
            } else {
                if (item1 !== item2) { return false; }
            }

        }
    };

    // Compare properties
    if (type === "[object Array]") {
        for (let i = 0; i < valueLen; i++) {
            if (compare(value1[i], value2[i]) === false) { return false; }
        }
    } else {
        for (const key in value1) {
            if (value1.hasOwnProperty(key)) {
                if (compare(value1[key], value2[key]) === false) { return false; }
            }
        }
    }
    // If nothing failed, return true
    return true;
}
