"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../src/index");
var assert = require("assert");
function InitOfo() {
    var testofo = new index_1.ObjectFromObject();
    testofo.loadSourceObject("", "./tests/sourceRef02.json");
    testofo.loadBrules("", "./tests/buildruleRefA2.json");
    testofo.buildTargetFromSourceByRules();
    var builtobject = testofo.getTargetObject();
    return builtobject;
}
/* TEST */
describe("Plain Value Test 01", function () {
    it('should return *Value of bObj.bObj3.bObj3a*', function () {
        var builtobject = InitOfo();
        var testprop1 = builtobject["tPlain3"];
        assert.deepStrictEqual(testprop1, "Value of bObj.bObj3.bObj3a");
        // expect(testprop1).to.equal("Value of bObj.bObj3.bObj3a");
    });
});
