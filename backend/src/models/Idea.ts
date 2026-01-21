import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface IdeaAttributes {
  id: number;
  userId: number;
  niche: string;
  platform: string;
  contentType: string;
  targetAudience: string;
  aiOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IdeaCreationAttributes extends Optional<IdeaAttributes, 'id'> {}

class Idea extends Model<IdeaAttributes, IdeaCreationAttributes> implements IdeaAttributes {
  public id!: number;
  public userId!: number;
  public niche!: string;
  public platform!: string;
  public contentType!: string;
  public targetAudience!: string;
  public aiOutput!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Idea.init(
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
    contentType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'content_type',
    },
    targetAudience: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'target_audience',
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
  },
  {
    sequelize,
    tableName: 'ideas',
  }
);

export default Idea;
