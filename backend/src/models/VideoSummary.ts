import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VideoSummaryAttributes {
  id: number;
  userId: number;
  videoTitle: string;
  videoUrl: string;
  videoTranscript: string;
  summaryLength: string;
  includeKeyPoints: boolean;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VideoSummaryCreationAttributes extends Optional<VideoSummaryAttributes, 'id'> {}

class VideoSummary extends Model<VideoSummaryAttributes, VideoSummaryCreationAttributes> implements VideoSummaryAttributes {
  public id!: number;
  public userId!: number;
  public videoTitle!: string;
  public videoUrl!: string;
  public videoTranscript!: string;
  public summaryLength!: string;
  public includeKeyPoints!: boolean;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VideoSummary.init(
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
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'video_url',
    },
    videoTranscript: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'video_transcript',
    },
    summaryLength: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'summary_length',
    },
    includeKeyPoints: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'include_key_points',
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
    tableName: 'video_summaries',
  }
);

export default VideoSummary;
