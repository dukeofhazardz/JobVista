const { MongoClient } = require('mongodb');

class DBClient {
    constructor() {
        this.host = 'localhost';
        this.port = 27017;
        this.database = 'job_vista';
        this.url = `mongodb://${this.host}:${this.port}/${this.database}`;
        this.client = new MongoClient(this.url, {useUnifiedTopology: true});
        this.connect();
    }
    async connect() {
        try {
            await this.client.connect();
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error.message);
        }
  }
    
    isAlive() {
        return this.client.isConnected();
    }
    
    async nbUsers() {
        const usersCollection = this.client.db(this.database).collection('users');
        const count = await usersCollection.countDocuments();
        return count;
    }
}

const dbClient = new DBClient();

export default dbClient;