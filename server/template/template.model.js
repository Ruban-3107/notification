const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const Schema = mongoose.Schema;

/**
 * Template Schema
 */
const TemplateSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  template:{
    type: String
  },
  subject:{
    type: String
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
TemplateSchema.method({
});

/**
 * Statics
 */
TemplateSchema.statics = {
  /**
   * Get Template
   * @param {notification_type} type - The notification type of template.
   * @returns {Promise<template, APIError>}
   */
  get(type) {
    return this.find({type: type})
      .exec()
      .then((template) => {
        if (template) {
          console.log(template+" template of model");
          return template;
        }
        const err = new APIError('No such Template type exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List  in descending order of 'created_date' timestamp.
   * @param {number} skip - Number of templates to be skipped.
   * @param {number} limit - Limit number of templates to be returned.
   * @returns {Promise<Templates[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  getTemplate(condition) {
    return this.find(condition)
      .exec()
      .then((template) => {
        if (template) {
          return template;
        }
        const err = new APIError('No such Template type exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
};

/**
 * @typedef Template
 */
module.exports = mongoose.model('_template', TemplateSchema);
