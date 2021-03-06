module.exports = function (sequelize, DataTypes) {
  var TodoList = sequelize.define('TodoList', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    createdAt: { type: DataTypes.DATE(6), allowNull: false },
    modifiedAt: { type: DataTypes.DATE(6), allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false }
  });

  TodoList.associate = models => {
    TodoList.belongsTo(models.Planner, {
      onDelete: 'CASCADE'
    });
    TodoList.hasMany(models.TodoItem, {
      onDelete: 'CASCADE'
    });
  };

  return TodoList;
};
