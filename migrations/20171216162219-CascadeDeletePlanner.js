'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint('Schedules', 'Schedules_ibfk_1'),
      queryInterface.removeConstraint('TodoLists', 'TodoLists_ibfk_1'),
      queryInterface.addConstraint('Schedules', ['PlannerId'], {
        type: 'FOREIGN KEY',
        references: {
          table: 'Planners',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
      queryInterface.addConstraint('TodoLists', ['PlannerId'], {
        type: 'FOREIGN KEY',
        references: {
          table: 'Planners',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return new Promise((resolve, reject) =>
      reject('This migration is not reversible.')
    );
  }
};
