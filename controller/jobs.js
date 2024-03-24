import dbClient from '../utils/db.js';
import { redisClient } from '../utils/redis.js';
import User from '../utils/helper.js';

import pkg from 'mongodb';
const { ObjectId } = pkg;
import request from 'request';

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

async function getJobsFromRedis() {
  try {
    const cachedJobs = await redisClient.get('jobs');
    if (cachedJobs === null) {
      const response = await fetchJobs(URL);
      if (response.statusCode == 200) {
        const data = JSON.parse(response.body);
        const duration = 24 * 60 * 60;
        await redisClient.set('jobs', JSON.stringify(data), duration);
        return data;
      }
      return new Error('Error getting response from API');
    }
    return JSON.parse(cachedJobs);
  } catch (error) {
    console.error('Error in getJobsFromRedis:', error);
    throw error;
  }
}

const Jobs = {
  async getJobs(req, res) {
    const user = await User.getUser(req);
    const PAGE_LIMIT = 25;
    const offset = req.query.offset || 0;
    const data = await getJobsFromRedis();
    const jobsSize = data.jobs.length;
    if (data) {
      const next = Number(offset) + PAGE_LIMIT;
      const jobs = data.jobs.slice(offset, next);
      if (jobsSize > offset) {
        return res.render('jobs', { jobs, user, offset: next });
      }
    }
    req.flash('message', 'No Jobs Found');
    return res.redirect(301, '/');
  },

  async getJob(req, res) {
    const { title } = req.params;
    const data = await getJobsFromRedis();
    if (data) {
      const job = data.jobs.find((job) => job.title === title);
      if (job) {
        const user = await User.getUser(req, res);
        const jobViews = user.jobViews ? Number(user.jobViews) + 1 : 1;
        const score = user.score ? Number(user.score) + 0.2 : 0.2;
        await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(user._id) }, { $set: { jobViews, score } });
        return res.render('job-details', { job, user });
      }
    }
    req.flash('message', 'Job not found');
    return res.redirect(301, '/jobboard');
  },

  async postApply(req, res) {
    const userId = await req.redisClient.get(`session:${req.session.id}`);
    if (userId) {
      const { jobTitle } = req.body;
      const { jobURL } = req.body;
      const newJob = {
        jobTitle,
        jobURL,
        appliedAt: new Date(),
      };
      const user = await User.getUser(req, res);
      const score = user.score ? Number(user.score) + 0.3 : 0.3;
      await dbClient.client.db(dbClient.database).collection('users').updateOne({ _id: ObjectId(userId) }, { $push: { jobs: newJob }, $set: { score } });
      res.send({ success: 'Application Saved' });
    } else {
      res.send({ error: 'You need to login first' });
    }
  },

  async getSearch(req, res) {
    const payload = req.body.payload.trim();
    const data = await getJobsFromRedis();
    const searchResult = data.jobs.filter((job) => job.title.toLowerCase().includes(payload.toLowerCase()));
    res.send({ payload: searchResult });
  },
};

export default Jobs;
