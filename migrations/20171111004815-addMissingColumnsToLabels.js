'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Labels', 'title', {
        type: Sequelize.STRING, allowNull: false
      }),
      queryInterface.addColumn('Labels', 'color', {
        type: Sequelize.STRING(10), allowNull: false, defaultValue: '#808080'
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Labels', 'title'),
      queryInterface.removeColumn('Labels', 'color')
    ]);
  }
};
