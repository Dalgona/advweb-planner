module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define("User", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    createdAt: { type: DataTypes.DATE(6), allowNull: false },
    modifiedAt: { type: DataTypes.DATE(6), allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING(128), allowNull: false, unique: true },
    auth: { type: DataTypes.STRING, allowNull: false },
    verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  });

  User.associate = models => {
    User.hasMany(models.Planner);
    User.hasMany(models.Label);
  };

  return User;
};
