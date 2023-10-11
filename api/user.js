import dbClient from "../utils/db";
import redisClient from '../utils/redis';
import { parse } from 'cookie';
const { ObjectId } = require('mongodb');
const User = {
    async nbUsers(req, res) {
        const userCount = await dbClient.nbUsers()
        return res.status(200).json({'Number of Users': userCount.toString()});
    },

    async getProfile(req, res) {
        const cookies = parse(req.headers.cookie || '');
        const token = cookies.sessionId;
        if (!token) {
            return res.redirect(301, '/login');
        }
        const key = `auth_${token}`;
        const userId = await redisClient.get(key);
        if (userId) {
            const user = await dbClient.client.db(dbClient.database).collection('users').findOne({_id: ObjectId(userId)});
            return res.render('profile', { user });
        }
        return res.redirect(301, '/');
    }
};

export default User;