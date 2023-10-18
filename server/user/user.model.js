
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const idvalidator = require('mongoose-id-validator');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  account_id: {
    type: Schema.Types.ObjectId,
    ref: "_account",
    unique:true
  },
  cmsData:{
    type: Boolean,
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
UserSchema.method({});

/**
 * Statics
 */
UserSchema.statics = {

  getUsers(appId) {
    return this.find({'appId': { $in: [appId] }})
        .exec()
        .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError("No user details found ", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model("_user", UserSchema);
