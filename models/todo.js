const mongoose = require('mongoose');
const { prioritySchema } = require('./priority');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const todoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 5,
    max: 250,
  },
  priority: {
    type: prioritySchema,
    required: true,
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
  dueDate: Date,
});

const Todo = mongoose.model('Todo', todoSchema);

function validateTodo(todo) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(250).required(),
    priorityId: Joi.objectId().required(),
  });
  return schema.validate(todo);
}

module.exports.Todo = Todo;
module.exports.todoSchema = todoSchema;
module.exports.validate = validateTodo;
