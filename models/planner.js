module.exports = function (sequelize, DataTypes) {
  var Planner = sequelize.define('Planner', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    createdAt: { type: DataTypes.DATE(6), allowNull: false },
    modifiedAt: { type: DataTypes.DATE(6), allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false }
  });

  Planner.associate = models => {
    Planner.belongsTo(models.User, {
      onDelete: 'CASCADE'
    });
    Planner.hasMany(models.Schedule, {
      onDelete: 'CASCADE'
    });
    Planner.hasMany(models.TodoList, {
      onDelete: 'CASCADE'
    });
  };

  return Planner;
};