import dotenv from "dotenv";
dotenv.config();
import MongoClient from "mongodb/lib/mongo_client.js";
import pkg from 'mongodb';
const { ServerApiVersion } = pkg;

class DBClient {
    constructor() {
        const username = process.env.MONGODB_USERNAME;
        const password = process.env.MONGODB_PASSWORD;
        
        this.uri = `mongodb+srv://${username}:${password}@jobvista-cluster-vercel.kwbf3oc.mongodb.net/?retryWrites=true&w=majority&appName=Jobvista-cluster-vercel`;
        this.client = new MongoClient(this.uri, {
            serverApi: {
              version: ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true,
              useUnifiedTopology: true,
            }
        });
        this.connect();
    }
    async connect() {
        try {
            await this.client.connect();
            await this.client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
