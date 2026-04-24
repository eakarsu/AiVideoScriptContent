import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PodcastTranscriptAttributes {
  id: number;
  userId: number;
  podcastTitle: string;
  podcastUrl: string;
  audioContent: string;
  outputFormat: string;
  includeTimestamps: boolean;
  includeSpeakerLabels: boolean;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PodcastTranscriptCreationAttributes extends Optional<PodcastTranscriptAttributes, 'id'> {}

class PodcastTranscript extends Model<PodcastTranscriptAttributes, PodcastTranscriptCreationAttributes> implements PodcastTranscriptAttributes {
  public id!: number;
  public userId!: number;
  public podcastTitle!: string;
  public podcastUrl!: string;
  public audioContent!: string;
  public outputFormat!: string;
  public includeTimestamps!: boolean;
  public includeSpeakerLabels!: boolean;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PodcastTranscript.init(
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
    podcastTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'podcast_title',
    },
    podcastUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'podcast_url',
    },
    audioContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'audio_content',
    },
    outputFormat: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'output_format',
    },
    includeTimestamps: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'include_timestamps',
    },
    includeSpeakerLabels: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'include_speaker_labels',
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
    tableName: 'podcast_transcripts',
  }
);

export default PodcastTranscript;
