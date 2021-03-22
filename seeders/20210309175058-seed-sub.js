'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Subs', [{
      name: 'ns3c',
      amount: 1,
      tier: "2000",
      gifted: false,
      sender: "",
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: '',
      amount: 3,
      tier: "1000",
      gifted: true,
      sender: 'ns3c',
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'steaktyphoon',
      amount: 4,
      tier: "1000",
      gifted: false,
      sender: "",
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'ruddystaken',
      amount: 1,
      tier: "1000",
      gifted: false,
      sender: '',
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'Hot_Robot',
      amount: 3,
      tier: "1000",
      gifted: false,
      sender: '',
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'ghost_doggo22',
      amount: 3,
      tier: "1000",
      gifted: false,
      sender: '',
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'embelcourtgameyt',
      amount: 3,
      tier: "1000",
      gifted: false,
      sender: '',
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'Buttercuppzz',
      amount: 1,
      tier: "1000",
      gifted: false,
      sender: '',
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'human0125',
      amount: 1,
      tier: "1000",
      gifted: false,
      sender: '',
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'Zedit101',
      amount: 3,
      tier: "1000",
      gifted: false,
      sender: '',
      subExtension: "",
      month: "",
      message: "", 
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    },
    {
      name: 'Rhodegal',
      amount: 3,
      tier: "1000",
      gifted: false,
      sender: '',
      subExtension: "",
      month: "",
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
     await queryInterface.bulkDelete('Subs', null, {});
  }
};
