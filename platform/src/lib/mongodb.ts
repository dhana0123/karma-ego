import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

const mongoClientPromise =
  globalForMongo.mongoClientPromise ?? new MongoClient(uri).connect();

if (!globalForMongo.mongoClientPromise) {
  globalForMongo.mongoClientPromise = mongoClientPromise;
}

export async function getMongoDb() {
  const client = await mongoClientPromise;
  const dbName = process.env.MONGODB_DB || "karma_ego";
  return client.db(dbName);
}
