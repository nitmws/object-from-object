import { expect } from "chai";
import * as fs from "fs";
import {ObjectFromObject as Ofo} from "../src/index";

function InitOfo(): object {
    const testofo = new Ofo();
    testofo.loadSourceObject("", "./test/sourceRef02.json");
    testofo.loadBrules("", "./test/buildingrulesRefA.json");
    testofo.buildTargetFromSourceByRules();
    const builtobject: object = testofo.getTargetObject();
    const bobjJson: string = JSON.stringify(builtobject, null, 4);
    fs.writeFile("./test/builttargetA02.json", bobjJson, (err: any) => {
        if (err) { throw err; }
    });
    return builtobject;
}

/* TEST */
describe("Object From Object Test 01", () => {
    const builtobject: any = InitOfo();
    it("<tPlainPreset1> should return *this is a preset value*",
        () => {
            expect(builtobject.tPlainPreset1).to.equal("this is a preset value");
        });
    it("<tPlain3> should return *Value of bObj.bObj3.bObj3a*",
        () => {
            expect(builtobject.tPlain3).to.equal("Value of bObj.bObj3.bObj3a");
        });
    it("<tPlainStr1> should return *56*",
        () => {
            expect(builtobject.tPlainStr1).to.equal("56");
        });
    it("<tPlainNum1> should return 34dec",
        () => {
            expect(builtobject.tPlainNum1).to.equal(34);
        });
    it("Length of array <tArr1> should be 3",
        () => {
            expect(builtobject.tArr1.length).to.equal(3);
        });
    it("<tObj1.tObj1c.tObj1cA> should return *Value of bObj.bObj3.bObj3a*",
        () => {
            expect(builtobject.tObj1.tObj1c.tObj1cA).to.equal("Value of bObj.bObj3.bObj3a");
        });
    it("Length of array <tArr4[1].tArr4c.tArr4c2> should be 3",
        () => {
            expect(builtobject.tArr4[1].tArr4c.tArr4c2.length).to.equal(3);
        });
    it("<tArr4[0].tArr4c.tArr4c1> should return *Value of eArrObj[0].eArrObj3.eArrObj3a*",
        () => {
            expect(builtobject.tArr4[0].tArr4c.tArr4c1).to.equal("Value of eArrObj[0].eArrObj3.eArrObj3a");
        });
    it("<tArr4[1].tArr4c.tArr4c2[1]> should return *Val of eArrObj[1].eArrObj3.eArrObj3b[1]*",
        () => {
            expect(builtobject.tArr4[1].tArr4c.tArr4c2[1]).to.equal("Val of eArrObj[1].eArrObj3.eArrObj3b[1]");
        });
    it("Length of array <tArr6p> should be 0",
        () => {
            expect(builtobject.tArr6p.length).to.equal(0);
        });
});
