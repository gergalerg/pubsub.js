var Cur = require('./currency');

var can = 0.91;

var cur = new Cur(can);
console.log(cur.canadianToUS(50));
console.log(cur.USToCanadian(50));