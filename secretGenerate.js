const crypto = require('crypto');

const text = 'shimmerblue';
const secret = crypto.createHash('sha256').update(text).digest('hex');

const testToken = crypto.randomBytes(32).toString('hex');
console.log(testToken);

console.log(secret);
