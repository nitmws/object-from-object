# object-from-object
Typescript/Javascript Node.js module for building a new object from a template with values from another object.

## Usage

``` Typescript
import {ObjectFromObject as Ofo} from "object-from-object"

const myofo = new Ofo();
if (!myofo.loadSourceObject("", "./source02.json")) {
    return;
}
if (!myofo.loadBrules("", "./buildingrulesA.json")) {
    return;
}
myofo.buildTargetFromSourceByRules();
const builtobject: any = myofo.getTargetObject();

```

## Overview

This module provides a framework for building a new object complying to building rules and copying property values from a source object.

* The object named Target Object is the result of the building process. 

* The object named Building Rules is the template for building the Target Object. It provides the hierarchical structure of properties. And the value of a property in the Building Rules object is a rule for retrieving a value from another object, called Source Object.

* The object named Source Object provides a structure of properties and its values. These values can be copied into the Target Object by rules in the Building Rules object.

### The Building Rules

The building rules for the Target Object are expressed by an object.

#### The Structure

The structure of the Building Rules object is a template for the Target Object. If a property of the Building Rules object can be filled with data from the Source Object this property is integrated into the Target Object, else not.
 
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
  "tPlainPreset1": "VALSTR=this is a preset value",
  "tPlain1": "aPlain",
  "tPlain2": "bObj",
  "tPlainStr1": "aPlainNum$#$ToStr",
  "tPlainNum1": "aPlainNumericStr$#$ToNum",
  "ofo$COMMENT_tPlain2": "tPlain2 does not deliver object - actually it should ",
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

* buildruleRef... .json: a Building Rules object like the one above
* sourceRef... .json: a Source Object
* builttarget... . json: a Target Object which was built while running tests

#### Arrays

Building arrays needs some special considerations as some rules apply.

* The syntax rule for building an array is using square brackets and putting inside a Building Rule for the items inside the array. E.g. `"tArr1": [ "cArrPlain"]` to build an array of plain values or `"tArr2": [ { "tProp1": "sourceprop1[a].prop1a", "tProp1": "sourceprop1[a].prop1b",  }]` to build an array of objects.
* The count of items in an array is limited by the count of available items in the Source Object:
  * the Building Rule may address a property being an array of plain values or an array of objects. In this case all items from the Source Object are copied to the Target Object.
  * a Building Rule may address individual source properties being a plain value for building the properties of an object inside an array in the Target Object. (In other words: the object in the Target Object is built property by property and not as a copy of a full object.) In this case the first object for the array in the Target Object is created and used as reference. An additional object for the array of the Target Object is created and added as long as the count of its properties is the same as in the reference object. In other words: if not all the defined properties of a target object can be filled by values from the Source Object adding new objects to the array stops. Example: the first object has 5 properties, the 4th object only 3 properties. In this case only the first three objects, [0], [1] and [2], are copied to the Target Object. 
* What can be copied from the Source Object into an array in the Target Object depends also on the structure of the addressed property in the Source Object:
  * If the addressed property is an array of plain values only an array of plain values can be built in the Target Object. 
  * If the addressed property is an array of objects only an array objects with the same properties as in the Source Object can be built in the Target Object. 
  * An array of objects with explicitly defined properties can be built in the Target Object. In this case each property in the Building Rules needs to address a property in the Source Object - preferable a property inside an object which resides inside an array or a property being an array of plain values. 
  * If the addressed property is inside an object which is in an array an index variable can be used. E.g. the Source Object has this property   
  
```
"eArrObj3c": [
  {
    "eArrObj3c1": "Val of eArrObj3c[0].eArrObj3c1",
    "eArrObj3c2": "Val of eArrObj3c[0].eArrObj3c2"
  },
  {
    "eArrObj3c1": "Val of eArrObj3c[1].eArrObj3c1",
    "eArrObj3c2": "Val of eArrObj3c[1].eArrObj3c2"
  },
  {
    "eArrObj3c1": "Val of eArrObj3c[2].eArrObj3c1",
    "eArrObj3c2": "Val of eArrObj3c[2].eArrObj3c2"
  }
]
```
*
  * ... in this case a Building Rule ` eArrObj3c[a].eArrObj3c1 ` can be used for a property of an object inside an array. Using this index variable results in applying the index of the to-be-built array to the array in the Source Object: the value of the target property `tArr2[0].tProp1` is copied from   ` eArrObj3c[0].eArrObj3c1 `, the value of `tArr2[1].tProp1` is copied from   ` eArrObj3c[1].eArrObj3c1 ` etc. 
  * The index variable MUST be taken from the sequence 'a'..'z' in the hierarchical order of nested arrays of the Source Object. E.g. `eArrObj[a].eArrObj3.eArrObj3c[b].eArrObj3c1 ` indicates the properties eArrObj and eArrObj3c are an array of objects.

Find examples for using arrays in the Building Rules and the Source Object in these files in the /test folder:

* buildruleRef... .json: a Building Rules object like the one above
* sourceRef... .json: a Source Object
* builttarget... . json: a Target Object which was built while running tests

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

Builds the Target Object based on the Building Rules object and by retrieving the data from the Source Object.

To work properly it is required to load first the Building Rules object and the Source object.

