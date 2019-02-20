# object-from-object
Typescript/Javascript Node.js module for building a new object from a template with values from another object.

## Usage

``` Typescript
import {ObjectFromObject as Ofo} from "object-from-object"

const myofo = new Ofo();
myofo.loadSourceObject("", "./sourceObject.json");
myofo.loadBrules("", "./buildruleObject.json");
myofo.buildTargetFromSourceByRules();
const builtobject: any = myofo.getTargetObject();

```

## Overview

This module provides a framework for building a new object complying to building rules and ingesting data from a source object.

* The object named Building Rules is the template of the To-Be-Built Object. It provides the hierarchical structure of properties. And the value of a property is a rule for retrieving a value from another object, called Source Object.

* The object named Source Object provides a structure of properties and its values. These values can be copied into the To-Be-Built Object by rules in the Building Rules object.

* The object named To-Be-Built Object is the result of building it and is delivered to the user of the module. 

### The Building Rules

The building rules for the To-Be-Built Object are expressed by an object.

#### The Structure

The structure of the Building Rules object is a template for the To-Be-Built Object. If a property of the Building Rules object can be filled with data from the Source Object this property is integrated into the To-Be-Built Object.
 
Example:

Building Rules object:
``` 
{
    prop1: "...rule1...",
    prop2: "...rule2...",
    prop3: "...rule3..."
}
 ```

Let's assume the rules 1 and 3 for retrieving data from the Source Object can be satisfied. This will be the resulting To-Be-Built Object:
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
   * prop8[a] = the structure of the Buildung Rules object defines an array and the Source Object has an array of values for prop8. In this case the items of the array of prop8 are copied to the items of the property in the To-Be-Built Object in the same sequence - as long as items are available in the Source Object.
   * The count of this sequence is limited to 10 items. Each property name is an item and each index of an array is an item. Example: prop9.prop9a.prop9a1[a].prop9a1a makes an item count of 5.
 * The property names - value transformation rules separator: `$#$` - must be used if a sequence of property names and a rule for transforming the value is defined.
 * Value transformation rule: a name of a transformation rule taken from this enumeration
   * ToStr = converts a numeric value to a string
   * ToNum = converts a string value to a number - if the format of the string complies.
 

## API

### class ObjectFromObject()

#### loadBrules(json: string, jsonfilepath: string )

Type: `Function`

Loads the template for the To-Be-Built Object with rules for retrieving data from the source object

##### json

Type: `String`

The object serialized as JSON string

##### jsonfilepath

Type: `String`

Path of the file containing the object  seralized as JSON

#### loadSourceObject( json: string, jsonfilepath: string )

Type: `Function`

Loads the object acting as source for the To-Be-Built Object.

##### json

Type: `String`

The object serialized as JSON string

##### jsonfilepath

Type: `String`

Path of the file containing the object  seralized as JSON


