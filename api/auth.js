import dbClient from '../utils/db';
import sha1 from 'sha1';

const Auth = {
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
        const hashedPW = sha1(password);
        const newUser = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            hashedPassword: hashedPW,
            phoneNo: phoneNo,
            address: address,
        };
        const result = await dbClient.client.db(dbClient.database).collection('users').insertOne(newUser);
        return res.status(201).json({
            id: result.insertedId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNo: phoneNo,
            address: address,
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