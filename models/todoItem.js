module.exports = function (sequelize, DataTypes) {
  var TodoItem = sequelize.define('TodoItem', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    createdAt: { type: DataTypes.DATE(6), allowNull: false },
    modifiedAt: { type: DataTypes.DATE(6), allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    complete: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  });

  TodoItem.associate = models => {
    TodoItem.belongsTo(models.TodoList, {
      onDelete: 'CASCADE'
    });
  };

  return TodoItem;
};