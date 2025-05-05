const path = require('path');

module.exports = {
  env: {
    path: path.resolve(__dirname, '.env')
  },
  db: {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'interview_prep'
  }
}; 