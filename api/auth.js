import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
const path = require('path');
const fs = require('fs');
const FOLDER_PATH = './job_vista_resumes/';
let filePath = '';

const Auth = {

    async getConnect(request, response) {
    const authorization = request.header('Authorization') || null;
    if (!authorization) return response.status(401).send({ error: 'Unauthorized' });

    const buff = Buffer.from(authorization.replace('Basic ', ''), 'base64');
    const credentials = {
      email: buff.toString('utf-8').split(':')[0],
      password: buff.toString('utf-8').split(':')[1],
    };

    if (!credentials.email || !credentials.password) return response.status(401).send({ error: 'Unauthorized' });

    credentials.password = sha1(credentials.password);

    const userExists = await dbClient.db.collection('users').findOne(credentials);
    if (!userExists) return response.status(401).send({ error: 'Unauthorized' });

    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, userExists._id.toString(), 86400);

    return response.status(200).send({ token });
  },

  async getDisconnect(request, response) {
    const token = request.header('X-Token') || null;
    if (!token) return response.status(401).send({ error: 'Unauthorized' });

    const redisToken = await redisClient.get(`auth_${token}`);
    if (!redisToken) return response.status(401).send({ error: 'Unauthorized' });

    await redisClient.del(`auth_${token}`);
    return response.status(204).send();
  },
    async getHome(req, res) {
        return res.render('base', {title: 'JobVista'});
    },

    async getSignup(req, res) {
        return res.render('signup', {title: 'JobVista'});
    },

    async getLogin(req, res) {
        return res.render('login', {title: 'JobVista'});
    },

    async postSignup(req, res) {
        const { firstName, lastName, email, password, phoneNo, address } = req.body;
        if (!firstName) {
            return res.status(400).json({error: 'Missing First Name'});
        }
        if (!lastName) {
            return res.status(400).json({error: 'Missing Last Name'});
        }
        if (!email) {
            return res.status(400).json({error: 'Missing Email'});
        }
        if (!password) {
            return res.status(400).json({error: 'Missing Password'});
        }
        if (!phoneNo) {
            return res.status(400).json({error: 'Missing Phone Number'});
        }
        if (!address) {
            return res.status(400).json({error: 'Missing Address'});
        }
        const existingUser = await dbClient.client.db(dbClient.database).collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({error: 'User already exist'});
        }
        // Uploading resume
        if (req.files) {
            const resume = req.files.resume;
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
            firstName: firstName,
            lastName: lastName,
            email: email,
            hashedPassword: hashedPW,
            phoneNo: phoneNo,
            address: address,
            resumePath: filePath,
        };
        const result = await dbClient.client.db(dbClient.database).collection('users').insertOne(newUser);
        return res.status(201).json({
            id: result.insertedId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNo: phoneNo,
            address: address,
            resumeAt: filePath,
        });

    },

    async postLogin(req, res) {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({error: "Missing email"});
        }
        if (!password) {
            return res.status(400).json({error: "Missing password"});
        }
        const userCheck = await dbClient.client.db(dbClient.database).collection('users').findOne({ email });
        if (!userCheck) {
            return res.status(400).json({error: `User with ${email} does not exist`});
        }
        const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ email, hashedPassword: sha1(password) });
        if (!user) {
            return res.status(400).json({error: `Password is incorrect`});
        }
        return res.status(201).json({'id': user._id.toString(), 'email': user.email});
    }
};

export default Auth;
