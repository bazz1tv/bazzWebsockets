'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sub extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Sub.init({
    name: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    tier: DataTypes.STRING,
    gifted: DataTypes.BOOLEAN,
    sender: DataTypes.STRING,
    subExtension: DataTypes.BOOLEAN,
    month: DataTypes.STRING,
    message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Sub',
  });
  return Sub;
};