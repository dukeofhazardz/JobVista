import sha1 from 'sha1';
import dbClient from '../utils/db';
import User from '../utils/helper';

const path = require('path');
const fs = require('fs');

const STATIC_PATH = './static/';
const RESUME_PATH = '/job_vista_resumes/';
const AVATAR_PATH = '/job_vista_avatars/';
let resumeFilePath = '';
let avatarFilePath = '';
let imageFile = '';
let resumeFile = '';

const Auth = {
  async getHome(req, res) {
    const user = await User.getUser(req);
    return res.redirect(301, '/jobboard', { user, message: req.flash('message')});
  },

  async getSignup(req, res) {
    const user = await User.getUser(req);
    return res.render('signup', { user, message: req.flash('message') });
  },

  async getLogin(req, res) {
    const user = await User.getUser(req);
    return res.render('login', { user, message: req.flash('message') });
  },

  async postSignup(req, res) {
    const {
      firstName, lastName, email, password, phoneNo, address, occupation, skills,
    } = req.body;
    if (!firstName) {
      req.flash('message', 'Missing First Name');
      return res.redirect(301, '/signup');
    }
    if (!lastName) {
      req.flash('message', 'Missing Last Name');
      return res.redirect(301, '/signup');
    }
    if (!email) {
      req.flash('message', 'Missing Email');
      return res.redirect(301, '/signup');
    }
    if (!password) {
      req.flash('message', 'Missing Password');
      return res.redirect(301, '/signup');
    }
    if (!phoneNo) {
      req.flash('message', 'Missing Phone Number');
      return res.redirect(301, '/signup');
    }
    if (!address) {
      req.flash('message', 'Missing Address');
      return res.redirect(301, '/signup');
    }
    if (!occupation) {
      req.flash('message', 'Missing Occupation');
      return res.redirect(301, '/signup');
    }
    const existingUser = await dbClient.client.db(dbClient.database).collection('users').findOne({ email });
    if (existingUser) {
      req.flash('message', 'User already exist');
      return res.redirect(301, '/signup');
    }
    // Uploading resume
    if (req.files) {
      const { resume } = req.files;
      resumeFilePath = path.join(STATIC_PATH + RESUME_PATH + email, resume.name);
      resumeFile = path.join(RESUME_PATH + email, resume.name);
      fs.mkdirSync(STATIC_PATH + RESUME_PATH + email, { recursive: true });
      resume.mv(resumeFilePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Resume uploaded');
        }
      });

      const { avatar } = req.files;
      avatarFilePath = path.join(STATIC_PATH + AVATAR_PATH + email, avatar.name);
      imageFile = path.join(AVATAR_PATH + email, avatar.name);
      fs.mkdirSync(STATIC_PATH + AVATAR_PATH + email, { recursive: true });
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
      skills,
      resumePath: resumeFile,
      avatarPath: imageFile,
      createdAt: new Date(),
      updatedAt: new Date(),
      jobs: [],
    };
    await dbClient.client.db(dbClient.database).collection('users').insertOne(newUser);
    res.cookie('email');
    req.flash.message('registration successful, you can now login.');
    return res.redirect(301, '/login');
  },

  async postLogin(req, res) {
    const { email, password } = req.body;

    if (!email) {
      req.flash('message', 'Missing email');
      return res.redirect(301, '/login');
    }
    if (!password) {
      req.flash('message', 'Missing password');
      return res.redirect(301, '/login');
    }
    const userCheck = await dbClient.client.db(dbClient.database).collection('users').findOne({ email });
    if (!userCheck) {
      req.flash('message', `User with ${email} does not exist`);
      return res.redirect(301, '/login');
    }
    const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ email, hashedPassword: sha1(password) });
    if (!user) {
      req.flash('message', 'Password is incorrect');
      return res.redirect(301, '/login');
    }
    const userId = user._id.toString();
    const duration = 24 * 60 * 60; // 24 hours (in seconds)
    await req.redisClient.set(`session:${req.session.id}`, userId, duration);
    return res.redirect(301, '/myprofile');
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
