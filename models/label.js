module.exports = function (sequelize, DataTypes) {
  var Label = sequelize.define('Label', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    createdAt: { type: DataTypes.DATE(6), allowNull: false },
    modifiedAt: { type: DataTypes.DATE(6), allowNull: false },
  });

  Label.associate = models => {
    Label.belongsTo(models.User, {
      onDelete: 'CASCADE'
    });
    Label.belongsToMany(models.Schedule, { through: 'LabeledSchedule' });
  };

  return Label;
};