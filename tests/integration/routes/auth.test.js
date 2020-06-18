const request = require('supertest');
const { User } = require('../../../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

describe('/api/auth', () => {
  let server;
  let user;
  let userDb;

  beforeEach(async () => {
    server = require('../../../index');
    userDb = new User({
      name: 'John',
      email: 'john96@gmail.com',
      username: 'john96',
      password: '12345',
    });

    user = _.pick(userDb, ['email', 'password']);

    const salt = await bcrypt.genSalt(10);
    userDb.password = await bcrypt.hash(userDb.password, salt);

    await userDb.save();
  });

  afterEach(async () => {
    server.close();
    await User.remove({});
  });

  const exec = () => {
    return request(server).post('/api/auth').send(user);
  };

  test('should return token with properties _id, isAdmin, name, username, email to the user if its logged', async () => {
    const res = await exec();

    const token = res.text;
    const decode = jwt.verify(token, config.get('jwtPrivateKey'));

    expect(res.status).toBe(200);
    expect(decode).toHaveProperty('name', userDb.name);
    expect(decode).toHaveProperty('email', userDb.email);
    expect(decode).toHaveProperty('_id', userDb._id.toHexString());
    expect(decode).toHaveProperty('isAdmin', userDb.isAdmin);
  });

  test('should return 400 if user email is not found', async () => {
    user.email = 'a@gmail.com';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  test('should return 400 if user password does not match', async () => {
    user.password = 'password';

    const res = await exec();

    expect(res.status).toBe(400);
  });
});
