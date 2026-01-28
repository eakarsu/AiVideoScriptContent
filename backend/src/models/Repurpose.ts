import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RepurposeAttributes {
  id: number;
  userId: number;
  originalContent: string;
  sourcePlatform: string;
  targetPlatform: string;
  contentType: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RepurposeCreationAttributes extends Optional<RepurposeAttributes, 'id'> {}

class Repurpose extends Model<RepurposeAttributes, RepurposeCreationAttributes> implements RepurposeAttributes {
  public id!: number;
  public userId!: number;
  public originalContent!: string;
  public sourcePlatform!: string;
  public targetPlatform!: string;
  public contentType!: string;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Repurpose.init(
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
    originalContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'original_content',
    },
    sourcePlatform: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'source_platform',
    },
    targetPlatform: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'target_platform',
    },
    contentType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'content_type',
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
    tableName: 'repurpose',
  }
);

export default Repurpose;
