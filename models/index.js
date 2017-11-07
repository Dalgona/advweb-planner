var env = process.env.NODE_ENV || 'development';

const fs = require('fs');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
const Sequelize = require('sequelize');

if (process.env.DATABASE_URL) {
  var sequelize = new Sequelize(process.env.DATABASE_URL, config);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

var db = {};

fs
.readdirSync(__dirname, 'utf8')
.filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
.forEach(file => {
  let model = sequelize.import(path.join(__dirname, file));
  db[model.name] = model;
});

for (let modelName of Object.keys(db)) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
