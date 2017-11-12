'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('TodoLists', 'complete');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('TodoLists', 'complete', {
      type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false
    });
  }
};
