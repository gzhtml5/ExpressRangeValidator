# expressRangeValidator.js
A library of digital expression range validator.<br>

 This is a javascript library, it allow you to dynamic setting validation expression from your backend, so you don't need to change your front end codes while the value range is changed.

While filling a form with lots of fields which field type is number, and you need to do some range validation for all the fields, such as the field value should be greater than 10, then the expression can be like this `X>10` or `10<X`. Just pass the expression `X>10` and the value into this library and you get a result.

## How to Use
The following codes shows how to refer a library and use it for you project.

**Import the library**
```javascript
const ERValidator = require("./lib/index");
```

**Validation result**<br>

runResult: `false` means don't pass validation; `true` means pass validation<br>
runResultCode: `0` validation is success; `1` validation is fail; `2` wrong express

**Normal express**
```javascript
let iExpress = 'x<10';
let validator = new ERValidator(iExpress, 9.0);
console.log(`${iExpress}`+' x= 9.0 : ', validator.runResult); // true
console.log('validator.runResultCode', validator.runResultCode); // 0
```

```javascript
let iExpress = 'x<=10, x>20.1';
let validator = new ERValidator(iExpress, 15.5);
console.log(`${iExpress}`+' x= 15.5 : ', validator.runResult); // false
console.log('validator.runResultCode', validator.runResultCode); // 1
```

```javascript
// variable 'Pa' is not equal to 'X', so need to set the options {toX: true}
let iExpress = 'Pa<10,Pa>=20.1';
let validator = new ERValidator(iExpress, 25.5, {toX: true});
console.log(`${iExpress}`+ ' Pa = 25.5 : ', validator.runResult); // true
console.log('validator.runResultCode', validator.runResultCode); // 0
```

```javascript
let iExpress = '10<Pa<20.1';
let validator = new ERValidator(`${iExpress}`, 15.5, {toX: true});
console.log(`${iExpress}`+ ' Pa = 15.5 : ',  validator.runResult); // true
console.log('validator.runResultCode', validator.runResultCode); // 0
```

**Special symbol**<br>
your input expression may contains some special symbols, for example `≥`, `≤`, `≠`...
```javascript
let iExpress = 'x≥10, x≤20.1';
let special = [['≥', '>='], ['≤', '<=']];
validator = new ERValidator(iExpress, 15.5, {special});
console.log(`${iExpress}` + ' x = 15.5 : ', validator.runResult); // true
```

**Enum express**
```javascript
let iExpress = '[CN, USA, JP, UK]';
let validator = new ERValidator(iExpress, 'CN');
console.log(`${iExpress}` + ' CN : ', validator.runResult);
```

**Wrong express**<br>
There are several wrong expresses. Because we can't tell the relationship between left part and right part of an express. Such as `10<X, 20.1<X`, the left part is `10<X` and righ part is `20.1<X`, the relationship can be `&&` or `||` , so these are wrong expresses.
```javascript
let eExpress1 = '10<X, 20.1<X';
let eExpress2 = '10>X, 20.1>X';
let eExpress3 = 'X>10, X>20.1';
let eExpress3 = 'X<20.1, X<10';
                ...
let validator = new ERValidator(eExpress1, 15.5);
console.log('validator.runResult', validator.runResult); // false
console.log('validator.runResult', validator.runResultCode); // 2
```

## Note
Unsupported situlations
```javascript
// situlation 1
let constVal = 'X<Math.PI';
let validator = new ERValidator(constVal, 3.0);

// situlation 2
let funVal = 'X<max(8, 19)';
let validator = new ERValidator(funVal, 15.5);

```
## Feedback
Email <a href="mailto:jonahshun@gmail.com">Jonah Shun</a> or open an issue

## Licence

[MIT](LICENCE)