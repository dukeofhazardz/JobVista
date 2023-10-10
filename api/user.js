import dbClient from "../utils/db";
import redisClient from "../utils/redis";
import { ObjectId } from 'mongodb';

const User = {
    async nbUsers(req, res) {
        const userCount = await dbClient.nbUsers()
        return res.status(200).json({'Number of Users': userCount.toString()});
    },

    async getMe(request, response) {
    const token = request.header('X-Token') || null;
    if (!token) return response.status(401).send({ error: 'Unauthorized' });

    const redisToken = await redisClient.get(`auth_${token}`);
    if (!redisToken) return response.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(redisToken) });
    if (!user) return response.status(401).send({ error: 'Unauthorized' });
    delete user.password;

    return response.status(200).send({ id: user._id, email: user.email });
  }
};

export default User;