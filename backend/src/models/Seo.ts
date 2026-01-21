import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SeoAttributes {
  id: number;
  userId: number;
  videoTitle: string;
  description: string;
  platform: string;
  targetKeywords: string;
  aiOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SeoCreationAttributes extends Optional<SeoAttributes, 'id'> {}

class Seo extends Model<SeoAttributes, SeoCreationAttributes> implements SeoAttributes {
  public id!: number;
  public userId!: number;
  public videoTitle!: string;
  public description!: string;
  public platform!: string;
  public targetKeywords!: string;
  public aiOutput!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Seo.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    targetKeywords: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'target_keywords',
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
  },
  {
    sequelize,
    tableName: 'seo_optimizations',
  }
);

export default Seo;
