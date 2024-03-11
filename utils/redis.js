import { createClient } from "redis";

class RedisClient {
    constructor() {
        this.client = createClient({url: "rediss://default:AVNS_ocvD9VgpdzpUfBrf2cv@jobvista-cache-dj71286-bed9.a.aivencloud.com:15629"}).on('error', (err) => {
            console.log(err);
        });
    }

    isAlive() {
        return this.client.connected;
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, reply) => {
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
            this.client.setex(key, duration, value, (err, reply) => {
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
            this.client.del(key, (err, reply) => {
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
