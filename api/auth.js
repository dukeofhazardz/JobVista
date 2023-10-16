import sha1 from 'sha1';
import dbClient from '../utils/db';
import User from '../utils/helper';

const path = require('path');
const fs = require('fs');

const FOLDER_PATH = './job_vista_resumes/';
const AVATAR_PATH = './job_vista_avatars/';
let resumeFilePath = '';
let avatarFilePath = '';

const Auth = {
  async getHome(req, res) {
    const user = await User.getUser(req);
    return res.redirect(301, '/jobboard', { user });
  },

  async getSignup(req, res) {
    const user = await User.getUser(req);
    return res.render('signup', { user });
  },

  async getLogin(req, res) {
    const user = await User.getUser(req);
    return res.render('login', { user });
  },

  async postSignup(req, res) {
    const {
      firstName, lastName, email, password, phoneNo, address, occupation,
    } = req.body;
    if (!firstName) {
      return res.status(400).json({ error: 'Missing First Name' });
    }
    if (!lastName) {
      return res.status(400).json({ error: 'Missing Last Name' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Missing Email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing Password' });
    }
    if (!phoneNo) {
      return res.status(400).json({ error: 'Missing Phone Number' });
    }
    if (!address) {
      return res.status(400).json({ error: 'Missing Address' });
    }
    if (!occupation) {
      return res.status(400).json({ error: 'Missing Occupation' });
    }
    const existingUser = await dbClient.client.db(dbClient.database).collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exist' });
    }
    // Uploading resume
    if (req.files) {
      const { resume } = req.files;
      resumeFilePath = path.join(FOLDER_PATH + email, resume.name);
      fs.mkdirSync(FOLDER_PATH + email, { recursive: true });
      resume.mv(resumeFilePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Resume uploaded');
        }
      });

      const { avatar } = req.files;
      avatarFilePath = path.join(AVATAR_PATH + email, avatar.name);
      fs.mkdirSync(AVATAR_PATH + email, { recursive: true });
      avatar.mv(avatarFilePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('avatar uploaded');
        }
      });
    }
    // hashing password
    const hashedPW = sha1(password);
    // curating new user
    const newUser = {
      firstName,
      lastName,
      email,
      hashedPassword: hashedPW,
      phoneNo,
      address,
      occupation,
      resumePath: resumeFilePath,
      avatarPath: avatarFilePath,
      createdAt: new Date(),
      updatedAt: new Date(),
      jobs: [],
    };
    await dbClient.client.db(dbClient.database).collection('users').insertOne(newUser);
    res.cookie('email');
    return res.redirect(301, '/login');
  },

  async postLogin(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const userCheck = await dbClient.client.db(dbClient.database).collection('users').findOne({ email });
    if (!userCheck) {
      return res.status(400).json({ error: `User with ${email} does not exist` });
    }
    const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ email, hashedPassword: sha1(password) });
    if (!user) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }
    const userId = user._id.toString();
    const duration = 24 * 60 * 60; // 24 hours (in seconds)
    await req.redisClient.set(`session:${req.session.id}`, userId, duration);
    return res.redirect(301, '/');
  },

  async postLogout(req, res) {
    await req.redisClient.del(`session:${req.session.id}`);
    req.session.destroy((err) => {
      if (err) {
        console.log('Error destorying session:', err);
      } else {
        return res.redirect(301, '/login');
      }
    });
  },
};

export default Auth;
