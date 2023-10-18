const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const Schema = mongoose.Schema;

/**
 * Notification Schema
 */
const NotificationSchema = new mongoose.Schema({
  mode: {
    type: String
  },
  content: {
    type: String
  },
  status: {
    type: String
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: '_user'
  },
  user_phone: {
    type: String
  },
  user_email: {
    type: String
  },
  booking_id: {
    type: Schema.Types.ObjectId,
    ref: '_booking'
  },
  notification_id: {
    type: String
  },
  subject: {
    type: String
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  notification_date: {
    type: String
  },
  notification_time: {
    type: String
  },
  notification_player_ids: {
    type: Array
  },
  notification_type: {
    type: String
  },
  notification_category:{
    type: String
  },
  notification_bookingtype: {
    type: String
  },
  seen:{
    type: Boolean,
    default: false
  },
  articleId :{
    type:String
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
NotificationSchema.method({
});

/**
 * Statics
 */
NotificationSchema.statics = {
  /**
   * Get Notification
   * @param {notification_type} type .
   * @returns {Promise<notification, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((notification) => {
        if (notification) {
          return notification;
        }
        const err = new APIError('No such notification exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  updateNotification(id ,notification) {
    return this.update({'notification_id': id},{ "$set": notification})
      .exec()
      .then((response) => {
        if (response) {
          return response;
        }
        const err = new APIError('No such notification exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List  in descending order of 'created_date' timestamp.
   * @param {number} skip - Number of notifications to be skipped.
   * @param {number} limit - Limit number of notifications to be returned.
   * @returns {Promise<Notification[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  /**
   * Get pending notification for specific date.
   * @param {number} date - specific date .
   * @returns {Promise<Notification[]>}
   */
  getPendingNotification(date) {
    return this.find({ $and: [{ notification_date: date }, { status: 'Pending' }] })
      .exec()
      .then((notification) => {
        if (notification) {
          return notification;
        }
        const err = new APIError('No notification for the date  exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  cancelNotification(id) {
    return this.update({ notification_id: id }, { $set: { status: 'Cancel' } })
      .exec()
      .then((notification) => {
        if (notification) {
          return notification;
        }
        const err = new APIError('No notification exists for the id !', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef Notification
 */
module.exports = mongoose.model('notification_status', NotificationSchema);
