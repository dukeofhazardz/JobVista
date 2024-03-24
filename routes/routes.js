import Auth from '../controller/auth.js';
import User from '../controller/user.js';
import Jobs from '../controller/jobs.js';
import { redisClient } from '../utils/redis.js';

import express from 'express';
import session from 'express-session';

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
router.get('/settings', User.getSettings);
router.post('/settings', User.postSettings);
router.get('/myprofile', User.getProfile);
router.get('/download', User.getResume);
router.get('/users', User.allUsers);
router.get('/users/:userID', User.getUser);
router.get('/jobboard', Jobs.getJobs);
router.get('/jobs/:title', Jobs.getJob);
router.post('/jobs/search', Jobs.getSearch);
router.post('/jobs/apply', Jobs.postApply);

export { router };
