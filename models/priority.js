const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const prioritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  importance: {
    type: Number,
    required: true,
  },
});

const Priority = mongoose.model('Priority', prioritySchema);

function validatePriority(priority) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    importance: Joi.number().required(),
  });
  return schema.validate(priority);
}

module.exports.Priority = Priority;
module.exports.prioritySchema = prioritySchema;
module.exports.validate = validatePriority;
