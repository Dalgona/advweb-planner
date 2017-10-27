const fs = require('fs');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config'));
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  config.db.dbname,
  config.db.user,
  config.db.password,
  config.db.options
);

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
