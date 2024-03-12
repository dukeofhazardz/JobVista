const { MongoClient } = require('mongodb');

class DBClient {
    constructor() {
        this.username = "nnaemekaxjohn";
        this.password = "nnaemeka1";

        const encodedUsername = encodeURIComponent(this.username);
        const encodedPassword = encodeURIComponent(this.password);

        this.uri = `mongodb://${encodedUsername}:${encodedPassword}@jobvista-cluster-vercel.kwbf3oc.mongodb.net`;
        this.options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authSource: 'admin', // Specify the authentication database
            retryWrites: true,
            writeConcern: {
                w: 'majority'
            },
            appName: 'Jobvista-cluster-vercel'
        };
        
        this.client = new MongoClient(this.uri, this.options);
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