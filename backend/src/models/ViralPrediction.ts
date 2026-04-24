import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ViralPredictionAttributes {
  id: number;
  userId: number;
  videoTitle: string;
  videoDescription: string;
  platform: string;
  niche: string;
  targetAudience: string;
  aiOutput: string;
  viralScore: number;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ViralPredictionCreationAttributes extends Optional<ViralPredictionAttributes, 'id'> {}

class ViralPrediction extends Model<ViralPredictionAttributes, ViralPredictionCreationAttributes> implements ViralPredictionAttributes {
  public id!: number;
  public userId!: number;
  public videoTitle!: string;
  public videoDescription!: string;
  public platform!: string;
  public niche!: string;
  public targetAudience!: string;
  public aiOutput!: string;
  public viralScore!: number;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ViralPrediction.init(
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
    videoTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'video_title',
    },
    videoDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'video_description',
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    niche: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    targetAudience: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'target_audience',
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
    viralScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'viral_score',
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'published'),
      allowNull: false,
      defaultValue: 'draft',
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scheduled_at',
    },
  },
  {
    sequelize,
    tableName: 'viral_predictions',
  }
);

export default ViralPrediction;
