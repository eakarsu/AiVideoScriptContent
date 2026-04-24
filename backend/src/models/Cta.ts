import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CtaAttributes {
  id: number;
  userId: number;
  videoTitle: string;
  contentType: string;
  platform: string;
  goal: string;
  targetAction: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CtaCreationAttributes extends Optional<CtaAttributes, 'id'> {}

class Cta extends Model<CtaAttributes, CtaCreationAttributes> implements CtaAttributes {
  public id!: number;
  public userId!: number;
  public videoTitle!: string;
  public contentType!: string;
  public platform!: string;
  public goal!: string;
  public targetAction!: string;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cta.init(
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
    contentType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'content_type',
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    goal: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    targetAction: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'target_action',
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
    tableName: 'ctas',
  }
);

export default Cta;
