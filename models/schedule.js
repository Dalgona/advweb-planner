module.exports = function (sequelize, DataTypes) {
  var Schedule = sequelize.define('Schedule', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    createdAt: { type: DataTypes.DATE(6), allowNull: false },
    modifiedAt: { type: DataTypes.DATE(6), allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    location: { type: DataTypes.STRING(1000), allowNull: false },
    startsAt: { type: DataTypes.DATE, allowNull: false },
    endsAt: { type: DataTypes.DATE, allowNull: false },
    allday: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  });

  Schedule.associate = models => {
    Schedule.belongsTo(models.Planner, {
      onDelete: 'CASCADE'
    });
    Schedule.belongsToMany(models.Label, { through: 'LabeledSchedule' });
  };

  return Schedule;
};