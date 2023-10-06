import Auth from '../api/auth';
import User from '../api/user';
import Jobs from '../api/Jobs';
const express = require('express');

const router = express.Router();
router.use(express.json);

router.post('/login', Auth.getLogin);
router.post('/signup', Auth.getSignup);
router.get('/home', Auth.getHome);
router.get('/profile', Auth.getProfile);

export default router;