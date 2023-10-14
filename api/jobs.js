import fetch from 'node-fetch';

const Jobs = {
  async getAll(req, res) {
    const jobs = await fetch('https://himalayas.app/jobs/api?limit=100').then((response) => response.json());

    return res.status(200).json({ jobs });
  },
};

export default Jobs;
