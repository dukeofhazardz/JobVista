import dbClient from '../utils/db';

const { ObjectId } = require('mongodb');
const request = require('request');

const URL = 'https://himalayas.app/jobs/api?limit=100';

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
    if (response.statusCode == 200) {
      const data = JSON.parse(response.body);
      return res.render('jobs', { data });
    }
    return res.redirect(response.statusCode, '/');
  },

  async getJob(req, res) {
    const {title} = req.params;
    const response = await fetchJobs(URL);
    if (response.statusCode == 200) {
     const data = JSON.parse(response.body);
     const job = data.jobs.find(job => job.title === title);
      if (job) {
        console.log(job);
        return res.render('job-details', { job });
      }
    }
    return res.redirect(response.statusCode, '/jobboard');
  },


  async postApply(req, res) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      const newJob = {
        userId: ObjectId(userId),
        appliedAt: new Date(),
      };
      await dbClient.client.db(dbClient.database).collection('jobs').insertOne({ newJob });
      return res.redirect(301, '/jobboard');
    }
    return res.redirect(301, '/login');
  },
};

export default Jobs;
