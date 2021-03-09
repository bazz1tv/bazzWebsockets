'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tip extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Tip.init({
    name: DataTypes.STRING,
    amount: DataTypes.DECIMAL(10,2),
    message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Tip',
  });
  return Tip;
};