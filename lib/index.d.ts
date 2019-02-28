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
    /**
     * Detects the type of the JS (any-)object
     * Returns one of the BruleValTypes.
     * @param brvalue
     */
    private static getBruleValType;
    protected _srcobj: object;
    protected _brules: object;
    protected _tgtobj: object;
    constructor();
    loadBrules(json: string, jsonfilepath: string): boolean;
    loadSourceObject(json: string, jsonfilepath: string): boolean;
    getTargetObject(): object;
    buildTargetFromSourceByRules(): void;
    private buildSingleValue;
    private buildSingleTobjectValue;
    private buildSingleArrayValue;
    private buildArrayofPlainValues;
    private buildArrayofTobjectValues;
    private getSourceSingleValue;
}
