import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CompetitorAttributes {
  id: number;
  userId: number;
  competitorName: string;
  competitorUrl: string;
  platform: string;
  analysisType: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CompetitorCreationAttributes extends Optional<CompetitorAttributes, 'id'> {}

class Competitor extends Model<CompetitorAttributes, CompetitorCreationAttributes> implements CompetitorAttributes {
  public id!: number;
  public userId!: number;
  public competitorName!: string;
  public competitorUrl!: string;
  public platform!: string;
  public analysisType!: string;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Competitor.init(
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
    competitorName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'competitor_name',
    },
    competitorUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'competitor_url',
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    analysisType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'analysis_type',
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
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
    tableName: 'competitors',
  }
);

export default Competitor;
