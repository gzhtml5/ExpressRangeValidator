const ERValidator = require("./lib/index");

let iExpress = 'x<10';
let validator = new ERValidator(iExpress, 9.0);
console.log(`${iExpress}` + ' x= 9.0 : ' + validator.runResult); // true
console.log('validator.runResultCode: ' + validator.runResultCode); // 0
console.log(' ');


iExpress = 'x<=10, x>20.1';
validator = new ERValidator(iExpress, 15.5);
console.log(`${iExpress}` + ' x=15.5 : ' + validator.runResult); // false
console.log('validator.runResultCode: ' + validator.runResultCode); // 1
console.log(' ');


iExpress = 'x=11, x=21.7';  // equal to express "x=11 or x=21.7"
validator = new ERValidator(iExpress, 21.7);
console.log(`${iExpress}` + ' x=21.7 : ' + validator.runResult); // true
console.log('validator.runResultCode: ' + validator.runResultCode); // 0
console.log(' ');


iExpress = 'Pa<10,Pa>=20.1';
validator = new ERValidator(iExpress, 25.5, { toX: true });
console.log(`${iExpress}` + ' Pa=25.5 : ' + validator.runResult); // true
console.log('validator.runResultCode: ' + validator.runResultCode); // 0
console.log(' ');


iExpress = '10<Pa<20.1';
validator = new ERValidator(`${iExpress}`, 15.5, { toX: true });
console.log(`${iExpress}` + ' Pa=15.5 : ' + validator.runResult); // true
console.log('validator.runResultCode: ' + validator.runResultCode); // 0
console.log(' ');


iExpress = 'x≥10, x≤20.1';
let special = [['≥', '>='], ['≤', '<=']];
validator = new ERValidator(iExpress, 15.5, { special });
console.log(`${iExpress}` + ' x=15.5 : ' + validator.runResult); // true
console.log('validator.runResultCode: ' + validator.runResultCode); // 0
console.log(' ');


iExpress = '[CN, USA, JP, UK]';
validator = new ERValidator(iExpress, 'CN');
console.log(`${iExpress}` + ' CN : ' + validator.runResult);
console.log('validator.runResultCode: ' + validator.runResultCode); // 0
console.log(' ');

// x=N,x=M,x=P,x=Q ... => x=N or x=M or x=P or x=Q
iExpress = 'x=10,x=11,x=12,x=0.88,x=-0.78';
validator = new ERValidator(iExpress, 12);
console.log(`${iExpress}` + ' x=12 : ' + validator.runResult);
console.log('validator.runResultCode: ' + validator.runResultCode); // 0
console.log(' ');


// (x>10,x<20),(x>10,x<40) => (x>10 and x<20) or (x>30 and x<40)
// (10<x<20),(30<x<40)
// (20<x<30),(x>40),(x<10)
iExpress = '(10<x<=20),(30>x)';
validator = new ERValidator(iExpress, 15);
console.log(`${iExpress}` + ' x=15 : ' + validator.runResult);
console.log('validator.runResultCode: ' + validator.runResultCode); // 0
console.log(' ');
