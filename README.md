# object-from-object
Typescript/Javascript Node.js module for building a new object from a template with values from another object.

## Usage

``` Typescript
import {ObjectFromObject as Ofo} from "object-from-object"

const myofo = new Ofo();
if (!testofo.loadSourceObject("", "./sourceRef02.json")) {
    return;
}
if (!testofo.loadBrules("", "./buildruleRefA2.json")) {
    return;
}
myofo.buildTargetFromSourceByRules();
const builtobject: any = myofo.getTargetObject();

```

## Overview

This module provides a framework for building a new object complying to building rules and ingesting data from a source object.

* The object named Target Object is the result of the building process. 

* The object named Building Rules is the template for building the Target Object. It provides the hierarchical structure of properties. And the value of a property in the Building Rules object is a rule for retrieving a value from another object, called Source Object.

* The object named Source Object provides a structure of properties and its values. These values can be copied into the Target Object by rules in the Building Rules object.

### The Building Rules

The building rules for the Target Object are expressed by an object.

#### The Structure

The structure of the Building Rules object is a template for the Target Object. If a property of the Building Rules object can be filled with data from the Source Object this property is integrated into the Target Object.
 
Example:

Building Rules object:
``` 
{
    prop1: "...rule1...",
    prop2: "...rule2...",
    prop3: "...rule3..."
}
 ```

Let's assume the rules 1 and 3 for retrieving data from the Source Object can be satisfied. This will be the resulting Target Object:
``` 
{
    prop1: "value1",
    prop3: "value3"
}
 ```

Rules for the structure of the Building Rules object:

* It must be a single object (not an array of objects)
* It may contain
  * properties with a plain value
  * properties with another object as value
  * properties with an array of plain values or objects as value

#### Rules for Retrieving Data from the Source

The value of a property must be finally a plain string value. (This means: either a single plain value, or a plain value in an object being the value of a parenting property, or a plain value in an array of plain values.)

This string defines the rule for retrieving a value from the Source Object:

`...hierarchy of property names in the Source Object..."$#$"...value transformation rule...`
 
 * The property names: a sequence of property names as used in JavaScript.
   * prop1 = a property at the top level of the Source Object
   * prop1.prop1a = a property in an object being the value of prop1
   * prop5[1] = the second item in the array of plain values of prop5
   * prop6[2].prop6c = a property from the third item in the array of objects being the value of prop6
   * prop8[a] = the structure of the Buildung Rules object defines an array and the Source Object has an array of values for prop8. In this case the items of the array of prop8 are copied to the items of the property in the Target Object in the same sequence - as long as items are available in the Source Object.
   * The count of this sequence is limited to 10 items. Each property name is an item and each index of an array is an item. Example: prop9.prop9a.prop9a1[a].prop9a1a makes an item count of 5.
   * Comments may be added by starting the property name with "ofo$COMMENT". In this case the property will be ignored while building the new object. (As JSON rules prohibit to use the same property name multiple times you should append a sequence to this basic name on your own.)
 * The property names - value transformation rules separator: `$#$` - must be used if a sequence of property names and a rule for transforming the value is defined.
 * Value transformation rule: a name of a transformation rule taken from this enumeration
   * ToStr = converts a numeric value to a string (for plain values only)
   * ToNum = converts a string value to a number - if the format of the string complies to the Javascript function parseInt - (for plain values only)
* Implicit value rule: if the string of the value of a property starts with VALSTR= the substring to its right becomes the value in the Target Object. If it starts with VALNUM= the string to its right will be transformed to a numeric value and applied to the property in the To-Be-Build Object.

Example:
```
{
  "tPlain0": "VALSTR=this is a preset value",
  "tPlain1": "aPlain",
  "tPlain2": "bObj",
  "tPlain3": "bObj.bObj3.bObj3a",
  "tPlain4a": "cArrPlain[1]",
  "tPlain4b": "cArrPlain[99]",
  "tPlain5": "dArrPlain[3]",
  "tPlain6": "eArrObj[1].eArrObj3.eArrObj3a",
  "tObj1": {
    "tObj1a": "bObj.bObj1",
    "tObj1b": "bObj.bObj2",
    "tObj1c": {
      "tObj1cA": "bObj.bObj3.bObj3a",
      "tObj1cB": "bObj.bObj3.bObj3b[1]"
    }
  },
  "tArr1": [ "cArrPlain"],
  "tArr2": [ "bObj.bObj3.bObj3b" ],
  "tArr3": [
    {
      "tArr3a": "bObj.bObj1",
      "tArr3b": "bObj.bObj2"
    }
  ],
  "tArr4": [
    {
      "tArr4a": "eArrObj[a].eArrObj1",
      "tArr4b": "eArrObj[a].eArrObj2",
      "tArr4c": {
        "tArr4c1": "eArrObj[a].eArrObj3.eArrObj3a",
        "tArr4c2": [ "eArrObj[a].eArrObj3.eArrObj3b" ]
      }
    }
  ],
  "tArr5": [
    {
      "tArr5a": "eArrObj[1].eArrObj3.eArrObj3c[a].eArrObj3c1",
      "tArr5b": "eArrObj[1].eArrObj3.eArrObj3c[a].eArrObj3c2"
    }
  ]
}
```

See these files in the /test folder as examples:

* buildruleRefA2.json: a Building Rules object
* sourceRef02.json: a Source Object

## API

### class ObjectFromObject()

#### loadBrules(json: string, jsonfilepath: string): boolean

Type: `Function`

Loads the template for the Target Object with rules for retrieving data from the source object

##### json

Type: `String`

The object serialized as JSON string

##### jsonfilepath

Type: `String`

Path of the file containing the object  seralized as JSON

##### returned value

Type: `Boolean`

`true` if the object was properly loaded, else `false` 

#### loadSourceObject( json: string, jsonfilepath: string): boolean

Type: `Function`

Loads the object acting as source for the Target Object.

##### json

Type: `String`

The object serialized as JSON string

##### jsonfilepath

Type: `String`

Path of the file containing the object  seralized as JSON


##### returned value

Type: `Boolean`

`true` if the object was properly loaded, else `false` 

#### getTargetObject(): object 

Type: `Function`

Returns the built Target Object.

##### returned value

Type: `Object`

The Target Object 

#### buildTargetFromSourceByRules(): void 

Type: `Function`

Builds the Target Object based on the Building Rules object and retrieving the data from the Source Object.

To work properly it is required to load first the Building Rules object and the Source object.

