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
};

export default Jobs;