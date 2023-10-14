import { json } from 'body-parser';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

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

async function getJobsFromRedis() {
  if (await redisClient.get('jobs') === null) {
    const response = await fetchJobs(URL);
    if (response.statusCode == 200) {
      const data = JSON.parse(response.body);
      const duration = 24 * 60 * 60;
      await redisClient.set('jobs', JSON.stringify(data), duration);
    } else {
      return new Error('Error getting response from API');
    }
  }
  const jobs = JSON.parse(await redisClient.get('jobs'));
  return jobs;
}

const Jobs = {
  async getJobs(req, res) {
    const PAGE_LIMIT = 50;
    const offset = req.query.offset || 0;
    const data = await getJobsFromRedis();
    if (data) {
      const next = offset + PAGE_LIMIT;
      const jobs = data.jobs.slice(offset, offset + PAGE_LIMIT);
      if (jobs.length > offset) {
        return res.render('jobs', { jobs, offset: next });
      }
    }
    return res.redirect(301, '/');
  },

  async getJob(req, res) {
    const { title } = req.params;
    const data = await getJobsFromRedis();
    if (data) {
      const job = data.jobs.find((job) => job.title === title);
      if (job) {
        return res.render('job-details', { job });
      }
    }
    return res.redirect(301, '/jobboard');
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
