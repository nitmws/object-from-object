export declare enum BruleContext {
    NA = 0,
    inArray = 1,
    inObject = 2,
    inSingle = 3
}
export declare enum BruleValType {
    String = 0,
    Number = 1,
    Tobject = 2,
    Array = 3,
    Undefined = 4
}
export declare const commentPropname = "ofo$COMMENT";
export declare const bruleValRuleSep = "$#$";
export declare const invalidNumber = -999999;
export declare class ObjectFromObject {
    protected _srcobj: object;
    protected _brules: object;
    protected _tgtobj: object;
    constructor();
    loadBrules(json: string, jsonfilepath: string): boolean;
    loadSourceObject(json: string, jsonfilepath: string): boolean;
    getTargetObject(): object;
    buildTargetFromSourceByRules(): void;
    private buildSinglePlainValue;
    private buildSingleTobjectValue;
    private buildSingleArrayValue;
    private buildArrayofPlainValues;
    private buildArrayofTobjectValues;
    private getSourcePlainValue;
    /**
     * Detects the type of the JS (any-)object
     * Returns one of the BruleValTypes.
     * @param brvalue
     */
    private getBruleValType;
    tEST01(): void;
}
