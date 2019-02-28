# object-from-object
Typescript/Javascript Node.js module for building a new object from a template with values from another object.

## Usage

Typescript

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

Javascript

``` Javascript
const Ofo = require("object-from-object");

const myofo = new Ofo();
if (!myofo.loadSourceObject("", "./source02.json")) {
    return;
}
if (!myofo.loadBrules("", "./buildingrulesA.json")) {
    return;
}
myofo.buildTargetFromSourceByRules();
const builtobject = myofo.getTargetObject();

```

## Overview

This module provides a framework for building a new object complying to building rules and copying property values from a source object.

* The object named Target Object is the result of the building process. 

* The object named Building Rules is the template for building the Target Object. It provides the hierarchical structure of properties. And the value of a property in the Building Rules object is a rule for retrieving a value from another object, called Source Object.

* The object named Source Object provides a structure of properties and its values. These values can be copied into the Target Object by rules in the Building Rules object.

### The Building Rules

The building rules for the Target Object are expressed by an object.

##### Used terminology
* plain values in the Source Object: values of the JavaScript type _string_ or _number_

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


The value of a Building Rules property can be:
* a string expressing a rule for retrieving value(s) from the Source Object.
* an object including one to many Building Rule properties
* an array using a single Building Rule or defining an array of objects with Building Rule properties. See more details about arrays below.


The Building Rule string defines how to retrieve a value from the Source Object. Its formal structure is:

`...property name(s) in the Source Object..."$#$"...value transformation rule...`
OR
`VALxxx=...preset value...`
 
 * **Property names**: a hierarchical sequence of property names as used in JavaScript. 
   * Examples are:
     * `prop1`: addresses a property at the hierarchical top level of the Source Object
     * `prop1.prop1a`: addresses a property in an object being the value of prop1
     * `prop5[1]`: addresses the second item in the array of values of prop5
     * `prop6[2].prop6c`: addresses a property in the third item in the array of objects being the value of prop6
   * The count of this sequence is limited to 10 items. Each property name is an item and each index of an array is an item. Example: prop9.prop9a.prop9a1[2].prop9a1a makes an item count of 5.
   * Comments may be added by starting the property name with "ofo$COMMENT". In this case the property will be ignored while building the new object. As JSON rules prohibit to use the same property name multiple times you should append variable string values to this basic name on your own.
 * **The separator `$#$`**: must be used if a sequence of property names and a rule for transforming the value is defined.
 * **Value transformation rule**: a name of a transformation rule taken from this enumeration
   * **ToStr** = converts a numeric value to a string
   * **ToNum** = converts a string value to a number - if the format of the string complies to the Javascript function parseInt
* **Preset value rule**: if the string of the value of a property starts with VALSTR= the substring to its right becomes the string value in the Target Object. If it starts with VALNUM= the string to its right will be transformed to a numeric value becoming the numeric value in the Target Object.

#### Arrays

Building arrays requires to follow some rules.

* The Building Rule syntax for building an array is using square brackets and putting inside a Building Rule for the items inside the array.
* A single Building Rule in the array addresses a Source Object property with an array of plain values or objects: the whole array - as it is - is copied from the Source to the Target Object.
* Inside the array an object with some Building Rules properties is defined. In this case an array of objects with these specified properties is built.
* The count of items in an array in the Target Object is limited by the count of available items in the Source Object:
  * the Building Rule may address a property being an array of plain values or an array of objects. In this case the same number of items are in the Target Object as in the Source Object.
  * Building Rules of the properties in an object inside an array may address properties in the Source Object. In this case the first object for the array in the Target Object is created and its count of properties used as reference. An additional object is created and added to the array of the Target Object if the count of its properties is the same as the reference count. In other words: if not all the defined properties of a target object can be filled by values from the Source Object anymore adding new objects to the array stops. 
  * ... Example: the first created object has 5 properties, the 4th object only 3 properties. In this case only the first three objects are added to the Target Object. 
  * If the addressed property of the Source Object is in an object inside an array an index variable can be used. E.g. the Source Object has this property   
  
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
  * The index variable MUST be taken from the sequence 'a'..'z' in the hierarchical order of nested arrays of the Source Object. E.g. `eArrObj[a].eArrObj3.eArrObj3c[b].eArrObj3c1 `. 

#### Examples 
Find examples of Building Rules, Source Objects and built Target Objects in the /test folder:

* buildingrulesRef... .json: a Building Rules object
* sourceRef... .json: a Source Object
* builttarget... . json: a Target Object which was built while running tests. The file names indicate which Building Rules and what Source Object was used.

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

