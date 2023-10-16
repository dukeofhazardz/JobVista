import dbClient from '../utils/db';

const path = require('path');
const fs = require('fs');

const STATIC_PATH = './static/';
const RESUME_PATH = '/job_vista_resumes/';
const AVATAR_PATH = '/job_vista_avatars/';
const { ObjectId } = require('mongodb');

const User = {
  async nbUsers(req, res) {
    const userCount = await dbClient.nbUsers();
    return res.status(200).json({ 'Number of Users': userCount.toString() });
  },

  async allUsers(req, res) {
    const users = await dbClient.client.db(dbClient.database).collection('users').find().toArray();
    if (users) {
      const userId = await req.redisClient.get(`session:${req.session.id}`);
      if (userId) {
        const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
        return res.render('users', { users, user });
      }
      return res.render('users', { users, user: '' });
    }
    return res.status(404).json({ error: 'No User Found' });
  },

  async getUser(req, res) {
    const userId = req.params.userID;
    if (userId) {
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      return res.render('profile', { user });
    }
    return res.status(404).json({ error: 'User Not Found' });
  },

  async getProfile(req, res) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      return res.render('profile', { user });
    }
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
        firstName, lastName, phoneNo, address, occupation, skills,
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
      if (occupation) {
        await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { occupation } });
      }
      if (skills) {
        await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { skills } });
      }
      if (req.files) {
        const { resume, avatar } = req.files;
        if (resume) {
            const resArray = resume.name.split('.');
            const ext = resArray[resArray.length - 1];
            if (ext !== 'pdf') {
                return res.status(401).json({error: 'resume must be pdf'});
            }
            const filePath = path.join(STATIC_PATH + RESUME_PATH + user.email, resume.name);
            const resumeFile = path.join(RESUME_PATH + user.email, resume.name);
            fs.mkdirSync(STATIC_PATH + RESUME_PATH + user.email, { recursive: true });
            resume.mv(filePath, (err) => {
              if (err) {
                console.log(err);
              } else {
                console.log('Resume uploaded');
              }
            });
    
            await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { resumePath: resumeFile } });    
        }
        if (avatar) {
            const avArray = avatar.name.split('.');
            const ext = avArray[avArray.length - 1];
            if (ext !== 'jpg') {
                return res.status(401).json({error: 'image must be jpg'});
            }
            const avatarFilePath = path.join(STATIC_PATH + AVATAR_PATH + user.email, avatar.name);
            const imageFile = path.join(AVATAR_PATH + user.email, avatar.name);
            fs.mkdirSync(STATIC_PATH + AVATAR_PATH + user.email, { recursive: true });
            avatar.mv(avatarFilePath, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('avatar uploaded');
                }
            });
            
            await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { avatarPath: imageFile } });
        }
    }
    await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { updatedAt: new Date() } });
    return res.redirect(301, '/settings');
    }
    return res.redirect(301, '/login');
  },

  async getResume(req, res) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      const filePath = user.resumePath;
      if (fs.existsSync(filePath)) {
        const fileArray = filePath.split('.');
        const ext = fileArray[fileArray.length - 1];
        res.setHeader('Content-disposition', `attachment; filename=${user.firstName}.${ext}`);
        res.setHeader('Content-type', 'application/octet-stream');

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    }

    return res.redirect(301, '/login');
  },

};

export default User;
