/**
 * Sahayog — MongoDB initialization script.
 *
 * Connects to MongoDB, loads every Mongoose model (which registers the
 * schemas + indexes defined in Backend/models), and syncs the indexes so the
 * collections are created and query-optimized before the app goes live.
 *
 * Usage:
 *   node Database/mongo-init.js
 *   MONGO_URI="mongodb+srv://..." node Database/mongo-init.js
 */

const path = require('path');
const mongoose = require('mongoose');

// Resolve models from the backend (which has mongoose installed).
const backendModels = path.resolve(__dirname, '..', 'Backend', 'models');

// Registers model definitions and their schema indexes.
require(path.join(backendModels, 'User'));
require(path.join(backendModels, 'Issue'));
require(path.join(backendModels, 'Project'));
require(path.join(backendModels, 'RoutingAssignment'));
require(path.join(backendModels, 'Notification'));

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sahayog_db';

async function init() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`[DB Init] Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

    // Create collections + indexes for every registered model.
    for (const model of Object.values(mongoose.models)) {
      await model.init(); // ensure indexes
      const indexes = await model.collection.indexes();
      console.log(
        `[DB Init] Collection "${model.collection.collectionName}" ready — ${indexes.length} index(es).`
      );
    }

    console.log('[DB Init] Database schema and indexes are in sync.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[DB Init] Error:', err.message);
    process.exit(1);
  }
}

init();