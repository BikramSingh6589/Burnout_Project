import mongoose, { Schema, model } from 'mongoose';
import { connectDatabase } from "../config/database.js";
import { logger } from "./logger.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, default: null },
  },
  {
    collection: 'users',
    strict: false,
    timestamps: true,
  },
);

const User = mongoose.models.User || model('User', userSchema);

const runCrudTest = async (): Promise<void> => {
  await connectDatabase();

  logger.info('Starting temporary User CRUD verification utility...');

  const testUser = {
    name: 'Burnout Integration Test',
    email: `burnout-test+${Date.now()}@example.com`,
    age: 18,
  };

  const createdUser = await User.create(testUser);
  logger.success(`Created User document with id ${createdUser._id}`);

  const foundUser = await User.findById(createdUser._id).lean();
  logger.info('Read User document:', foundUser ?? 'Document not found');

  const updatedUser = await User.findByIdAndUpdate(
    createdUser._id,
    { name: 'Burnout Integration Test Updated' },
    { new: true },
  );
  logger.success(`Updated User document to name: ${updatedUser?.name}`);

  await User.findByIdAndDelete(createdUser._id);
  logger.success('Deleted User document successfully.');

  await mongoose.disconnect();
  logger.info('Database test utility completed.');
};

if (require.main === module) {
  runCrudTest().catch((error) => {
    logger.error('Temporary CRUD verification failed.', error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

export { runCrudTest };
