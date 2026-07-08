const bcrypt = require('bcryptjs');
const targetHash = '$2a$10$RR6E18EqG38seiGsJQPqeOTpRIaPNb0Vs40n/OvewLclsUErB6YyO';
['1234', '12345', '1234567', '12345678', 'admin', 'password', 'clave'].forEach(pw => {
  if (bcrypt.compareSync(pw, targetHash)) console.log('FOUND:', pw);
});
