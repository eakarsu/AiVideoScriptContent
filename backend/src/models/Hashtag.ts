import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface HashtagAttributes {
  id: number;
  userId: number;
  topic: string;
  platform: string;
  niche: string;
  count: number;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface HashtagCreationAttributes extends Optional<HashtagAttributes, 'id'> {}

class Hashtag extends Model<HashtagAttributes, HashtagCreationAttributes> implements HashtagAttributes {
  public id!: number;
  public userId!: number;
  public topic!: string;
  public platform!: string;
  public niche!: string;
  public count!: number;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Hashtag.init(
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
    topic: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    niche: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
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
    tableName: 'hashtags',
  }
);

export default Hashtag;
