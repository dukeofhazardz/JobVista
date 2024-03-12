require("dotenv").config();
const Redis = require("ioredis");

const username = process.env.REDIS_USERNAME;
const password = process.env.REDIS_PASSWORD;

const redisURI = `rediss://${username}:${password}@jobvista-cache-dj71286-bed9.a.aivencloud.com:15629`;

class RedisClient {
    constructor() {
        this.redis = new Redis(redisURI, {
            maxRetriesPerRequest: 3
        });

        this.redis.on("error", (err) => {
            console.error("Redis error:", err);
        });
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.redis.get(key, (err, reply) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        });
    }
    
    async set(key, value, duration) {
        return new Promise((resolve, reject) => {
            this.redis.set(key, value, "EX", duration, (err, reply) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        });
    }
    
    async del(key) {
        return new Promise((resolve, reject) => {
            this.redis.del(key, (err, reply) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        });
    }
}

const redisClient = new RedisClient();
module.exports = redisClient;
