import {ObjectFromObject as Ofo} from "../src/index";
import chai = require('chai');
import assert = require('assert');
import { expect } from "chai";

function InitOfo(): object {
    const testofo = new Ofo();
    testofo.loadSourceObject("", "./test/sourceRef02.json");
    testofo.loadBrules("", "./test/buildruleRefA2.json");
    testofo.buildTargetFromSourceByRules();
    const builtobject: object = testofo.getTargetObject();
    return builtobject;
}

/* TEST */
describe("Plain Value Test 01", () => {
    it('should return *Value of bObj.bObj3.bObj3a*',
        () => {
            let builtobject: any = InitOfo();
            const testprop1: string = builtobject["tPlain3"];
            assert.deepStrictEqual(testprop1, "Value of bObj.bObj3.bObj3a");
            // expect(testprop1).to.equal("Value of bObj.bObj3.bObj3a");
        })
});
