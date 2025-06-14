const bcrypt = require('bcryptjs');
const password = "1";
const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);
console.log(hash);