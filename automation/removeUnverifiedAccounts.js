const cron = require('node-cron');
const { User } = require('../model/userSchema');

const removeUnverifiedAccounts = () => {
    // */second */minute */hour */day of moth */month */day of week
  cron.schedule('*/30 * * * *', async () => {
    const presetTimeMinusThirtyMin = new Date(Date.now() - 30 * 60 * 1000);
    await User.deleteMany({
      accountVerified: false,
      //$lt = less than , $gt = greater than
      createdAt: { $lt: presetTimeMinusThirtyMin }, 
    });
  });
};

module.exports = { removeUnverifiedAccounts };
