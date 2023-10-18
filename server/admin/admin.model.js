const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const Schema = mongoose.Schema;

/**
 * admin Schema
 */
const AdminSchema = new mongoose.Schema({
  config_type: {
      type: String,
      required: true,
      unique: true
    },
  config: {
    type: Object,
    required: true
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
AdminSchema.method({
});

/**
 * Statics
 */
AdminSchema.statics = {
  /**
   * Get admin
   * @param {config_type} config_type - The config_type of admin.
   * @returns {Promise<admin, APIError>}
   */
  get(type) {
    return this.find({config_type:type})
    .exec()
    .then((adminConfig) => {
      if (adminConfig) {
        return adminConfig;
      }
      const err = new APIError('No such admin Config exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  updateAdminConfig(body, params) {
    return this.findOneAndUpdate({config_type:params.config_type },
    { config: body.config },{new: true})
        .exec()
        .then((adminConfig) => {
        if (adminConfig) {
          return adminConfig;
        }
        const err = new APIError('No such admin Config exists!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  },

  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

// /**
//  * @typedef Setting
//  */
module.exports = mongoose.model('notification_admin', AdminSchema);
