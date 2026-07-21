import sequelize from './database';
import '../models';

async function migrate(): Promise<void> {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log('Database schema synchronized');
  } finally {
    await sequelize.close();
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
