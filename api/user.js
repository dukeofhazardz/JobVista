import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const path = require('path');
const fs = require('fs');

const FOLDER_PATH = './job_vista_resumes/';
const { ObjectId } = require('mongodb');

const User = {
  async nbUsers(req, res) {
    const userCount = await dbClient.nbUsers();
    return res.status(200).json({ 'Number of Users': userCount.toString() });
  },

  async getProfile(req, res) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      return res.render('profile', { user });
    }
    console.log('no userId');
    return res.redirect(301, '/login');
  },

  async getSettings(req, res) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      return res.render('settings', { user });
    }
    return res.redirect(301, '/login');
  },

  async postSettings(req, res) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      const {
        firstName, lastName, phoneNo, address,
      } = req.body;
      if (firstName) {
        await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { firstName } });
      }
      if (lastName) {
        await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { lastName } });
      }
      if (phoneNo) {
        await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { phoneNo } });
      }
      if (address) {
        await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { address } });
      }
      if (req.files) {
        const { resume } = req.files;
        const filePath = path.join(FOLDER_PATH + user.email, resume.name);
        fs.mkdirSync(FOLDER_PATH + user.email, { recursive: true });
        resume.mv(filePath, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('Resume uploaded');
          }
        });
        await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { resumePath: filePath } });
      }
      return res.redirect(301, '/settings');
    }
    return res.redirect(301, '/login');
  },

  async getResume(req, res) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      console.log(userId);
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      const filePath = user.resumePath;
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-disposition', `attachment; filename=${user.firstName}`);
        res.setHeader('Content-type', 'application/octet-stream');

        const fileStream = fs.createReadStream(filePath);
        console.log('about to download');
        fileStream.pipe(res);
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    }
    return res.redirect(301, '/login');
  },
};

export default User;
