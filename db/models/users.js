module.exports = function(sequelize, Sequelize) {
  return sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true
      }
    },
    admin: Sequelize.BOOLEAN,
    organization: Sequelize.STRING,
    updater_id: Sequelize.STRING,
    resetPasswordToken: Sequelize.STRING,
    resetPasswordExpires: Sequelize.DATE,
    failedLoginAttempts: Sequelize.INTEGER,
    failedLoginTime: Sequelize.DATE
  },
  {
    timestamps: false,
    freezeTableName: true,
    tableName: 'users'
  });
}
