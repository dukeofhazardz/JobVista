import Auth from '../api/auth'
import User from '../api/user';
import Jobs from '../api/jobs';
const express = require('express');

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', Auth.getHome);
router.get('/usercount', User.nbUsers);
router.get('/signup', Auth.getSignup);
router.get('/login', Auth.getLogin);
router.post('/signup', Auth.postSignup);
router.post('/login', Auth.postLogin);
/*
router.get('/home', Auth.getHome);
router.get('/profile', User.getProfile);
*/

export default router;
