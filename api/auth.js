import sha1 from 'sha1';
import fetch from 'node-fetch';
import dbClient from '../utils/db';


const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

const FOLDER_PATH = './job_vista_resumes/';
let filePath = '';

const Auth = {
  async getHome(req, res) {
    const jobs = await fetch('https://himalayas.app/jobs/api?limit=100').then((response) => response.json());

    const userId = await req.redisClient.get(`session:${req.session.id}`);
    console.log(userId);
    console.log(`session:${req.session.id}`);
    if (userId) {
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      return res.render('base', { user, jobs });
    }
    return res.render('base', { jobs });
  },

  async getSignup(req, res) {
    return res.render('signup');
  },

  async getLogin(req, res) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
      return res.render('login', { user });
    }
    return res.render('login');
  },

  async postSignup(req, res) {
    const {
      firstName, lastName, email, password, phoneNo, address,
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
    const existingUser = await dbClient.client.db(dbClient.database).collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exist' });
    }
    // Uploading resume
    if (req.files) {
      const { resume } = req.files;
      filePath = path.join(FOLDER_PATH + email, resume.name);
      fs.mkdirSync(FOLDER_PATH + email, { recursive: true });
      resume.mv(filePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Resume uploaded');
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
      resumePath: filePath,
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
