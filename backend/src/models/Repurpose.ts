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
  },
  {
    sequelize,
    tableName: 'repurpose',
  }
);

export default Repurpose;
