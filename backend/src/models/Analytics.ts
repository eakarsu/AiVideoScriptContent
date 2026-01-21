import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AnalyticsAttributes {
  id: number;
  userId: number;
  platform: string;
  metricType: string;
  dataInput: string;
  timeframe: string;
  aiOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnalyticsCreationAttributes extends Optional<AnalyticsAttributes, 'id'> {}

class Analytics extends Model<AnalyticsAttributes, AnalyticsCreationAttributes> implements AnalyticsAttributes {
  public id!: number;
  public userId!: number;
  public platform!: string;
  public metricType!: string;
  public dataInput!: string;
  public timeframe!: string;
  public aiOutput!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Analytics.init(
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
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    metricType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'metric_type',
    },
    dataInput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'data_input',
    },
    timeframe: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
  },
  {
    sequelize,
    tableName: 'analytics',
  }
);

export default Analytics;
