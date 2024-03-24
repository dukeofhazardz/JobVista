import dbClient from './db.js';

import pkg from 'mongodb';
const { ObjectId } = pkg;

const User = {
  async getUser(req) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      return user;
    }
    return { status: 404, error: 'User not found' };
  },
};
export default User;
