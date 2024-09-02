const crypto = require('crypto');

const text = 'shimmerblue';
const secret = crypto.createHash('sha256').update(text).digest('hex');

console.log(secret);
