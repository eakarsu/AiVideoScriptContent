import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DescriptionAttributes {
  id: number;
  userId: number;
  videoTitle: string;
  topic: string;
  platform: string;
  includeLinks: boolean;
  includeCta: boolean;
  aiOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DescriptionCreationAttributes extends Optional<DescriptionAttributes, 'id'> {}

class Description extends Model<DescriptionAttributes, DescriptionCreationAttributes> implements DescriptionAttributes {
  public id!: number;
  public userId!: number;
  public videoTitle!: string;
  public topic!: string;
  public platform!: string;
  public includeLinks!: boolean;
  public includeCta!: boolean;
  public aiOutput!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Description.init(
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
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    includeLinks: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'include_links',
    },
    includeCta: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'include_cta',
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
  },
  {
    sequelize,
    tableName: 'descriptions',
  }
);

export default Description;
