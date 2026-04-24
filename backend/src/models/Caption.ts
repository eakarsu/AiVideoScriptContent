import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CaptionAttributes {
  id: number;
  userId: number;
  videoTitle: string;
  videoContent: string;
  platform: string;
  captionStyle: string;
  includeEmojis: boolean;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CaptionCreationAttributes extends Optional<CaptionAttributes, 'id'> {}

class Caption extends Model<CaptionAttributes, CaptionCreationAttributes> implements CaptionAttributes {
  public id!: number;
  public userId!: number;
  public videoTitle!: string;
  public videoContent!: string;
  public platform!: string;
  public captionStyle!: string;
  public includeEmojis!: boolean;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Caption.init(
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
    videoContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'video_content',
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    captionStyle: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'caption_style',
    },
    includeEmojis: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'include_emojis',
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
    tableName: 'captions',
  }
);

export default Caption;
