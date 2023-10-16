import Auth from '../api/auth';
import User from '../api/user';
import Jobs from '../api/jobs';
import redisClient from '../utils/redis';

const express = require('express');
const session = require('express-session');

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(session({
  secret: 'jobvistasecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // set to true after https
    sameSite: 'strict',
  },
}));
router.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

router.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

router.get('/', Jobs.getJobs);
router.get('/usercount', User.nbUsers);
router.get('/signup', Auth.getSignup);
router.get('/login', Auth.getLogin);
router.post('/signup', Auth.postSignup);
router.post('/login', Auth.postLogin);
router.post('/logout', Auth.postLogout);
router.get('/profile', User.getProfile);
router.get('/settings', User.getSettings);
router.post('/settings', User.postSettings);
router.get('/download', User.getResume);
router.get('/jobboard', Jobs.getJobs);
router.get('/jobs/:title', Jobs.getJob);
router.post('/jobs/search', Jobs.getSearch);

export default router;
