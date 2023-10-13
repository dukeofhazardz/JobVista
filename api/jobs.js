import dbClient from "../utils/db";
const { ObjectId } = require('mongodb');
const request = require('request');
const URL = 'https://himalayas.app/jobs/api';

async function fetchJobs(url) {
    return new Promise((resolve, reject) => {
        request.get(url, (error, response) => {
            if (error) {
                reject(error);
            } else if (response.statusCode === 200) {
                resolve(response);
            } else {
               reject(response);
            }
        });
    });
}

const Jobs = {
    async getJobs(req, res) {
        const response = await fetchJobs(URL);
        return res.json({status: response.statusCode, data: response.body});
    },

    async postApply(req, res) {
        const userId = await req.redisClient.get('session:' + req.session.id);
        if (userId) {
            const newJob = {
                userId: ObjectId(userId),
                appliedAt: new Date(),
            };
            await dbClient.client.db(dbClient.database).collection('jobs').insertOne({ newJob });
            return res.redirect(301, '/jobboard');
        } else {
            return res.redirect(301, '/login');
        }
    },
};

export default Jobs;