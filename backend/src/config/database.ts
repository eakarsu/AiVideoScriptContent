import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../../.env') });

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: process.env.PGSSLROOTCERT ? {
    ssl: { rejectUnauthorized: true, ca: fs.readFileSync(process.env.PGSSLROOTCERT, 'utf8') }
  } : undefined,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

export default sequelize;
