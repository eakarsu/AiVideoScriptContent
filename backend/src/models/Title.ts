import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TitleAttributes {
  id: number;
  userId: number;
  topic: string;
  platform: string;
  style: string;
  keywords: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TitleCreationAttributes extends Optional<TitleAttributes, 'id'> {}

class Title extends Model<TitleAttributes, TitleCreationAttributes> implements TitleAttributes {
  public id!: number;
  public userId!: number;
  public topic!: string;
  public platform!: string;
  public style!: string;
  public keywords!: string;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Title.init(
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
    style: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    keywords: {
      type: DataTypes.STRING(500),
      allowNull: true,
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
    tableName: 'titles',
  }
);

export default Title;
