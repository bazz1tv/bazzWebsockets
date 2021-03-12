'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Bits', [{
      name: 'ns3c',
      amount: 947,
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'ns3c',
      amount: 500,
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'steaktyphoon',
      amount: 1,
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'LinkDefi',
      amount: 10,
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'Zedit101',
      amount: 116,
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    },
    {
      name: 'Zedit101',
      amount: 10,
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Bits', null, {});
  }
};
