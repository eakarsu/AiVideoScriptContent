import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TrendAttributes {
  id: number;
  userId: number;
  niche: string;
  platform: string;
  timeframe: string;
  region: string;
  aiOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TrendCreationAttributes extends Optional<TrendAttributes, 'id'> {}

class Trend extends Model<TrendAttributes, TrendCreationAttributes> implements TrendAttributes {
  public id!: number;
  public userId!: number;
  public niche!: string;
  public platform!: string;
  public timeframe!: string;
  public region!: string;
  public aiOutput!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Trend.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    niche: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    timeframe: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
  },
  {
    sequelize,
    tableName: 'trends',
  }
);

export default Trend;
