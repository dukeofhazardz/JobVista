const { MongoClient } = require('mongodb');

class DBClient {
    constructor() {
        this.password = ""
        this.database = 'job_vista';
        this.uri = `mongodb://mongodb+srv://nnaemekaxjohn:nnaemeka1@jobvista-cluster-vercel.kwbf3oc.mongodb.net/?retryWrites=true&w=majority&appName=Jobvista-cluster-vercel`;
        this.client = new MongoClient(this.uri, {useUnifiedTopology: true});
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