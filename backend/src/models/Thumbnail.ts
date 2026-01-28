import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ThumbnailAttributes {
  id: number;
  userId: number;
  videoTitle: string;
  topic: string;
  style: string;
  colorScheme: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ThumbnailCreationAttributes extends Optional<ThumbnailAttributes, 'id'> {}

class Thumbnail extends Model<ThumbnailAttributes, ThumbnailCreationAttributes> implements ThumbnailAttributes {
  public id!: number;
  public userId!: number;
  public videoTitle!: string;
  public topic!: string;
  public style!: string;
  public colorScheme!: string;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Thumbnail.init(
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
    topic: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    style: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    colorScheme: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'color_scheme',
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
    tableName: 'thumbnails',
  }
);

export default Thumbnail;
