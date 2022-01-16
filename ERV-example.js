const ERValidator = require("./lib/index");

let iExpress = 'x<10';
let validator = new ERValidator(iExpress, 9.0);
console.log(`${iExpress}`+' x= 9.0 : ', validator.runResult); // true
console.log('validator.runResultCode', validator.runResultCode); // 0

iExpress = 'x<=10, x>20.1';
validator = new ERValidator(iExpress, 15.5);
console.log(`${iExpress}`+' x= 15.5 : ', validator.runResult); // false
console.log('validator.runResultCode', validator.runResultCode); // 1


iExpress = 'Pa<10,Pa>=20.1';
validator = new ERValidator(iExpress, 25.5, {toX: true});
console.log(`${iExpress}`+ ' Pa = 25.5 : ', validator.runResult); // true
console.log('validator.runResultCode', validator.runResultCode); // 0


iExpress = '10<Pa<20.1';
validator = new ERValidator(`${iExpress}`, 15.5, {toX: true});
console.log(`${iExpress}`+ ' Pa = 15.5 : ',  validator.runResult); // true
console.log('validator.runResultCode', validator.runResultCode); // 0


iExpress = 'x≥10, x≤20.1';
let special = [['≥', '>='], ['≤', '<=']];
validator = new ERValidator(iExpress, 15.5, {special});
console.log(`${iExpress}` + ' x = 15.5 : ', validator.runResult); // true

iExpress = '[CN, USA, JP, UK]';
validator = new ERValidator(iExpress, 'CN');
console.log(`${iExpress}` + ' CN : ', validator.runResult);
