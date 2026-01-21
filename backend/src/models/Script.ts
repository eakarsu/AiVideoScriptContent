import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ScriptAttributes {
  id: number;
  userId: number;
  title: string;
  topic: string;
  platform: string;
  duration: string;
  tone: string;
  aiOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ScriptCreationAttributes extends Optional<ScriptAttributes, 'id'> {}

class Script extends Model<ScriptAttributes, ScriptCreationAttributes> implements ScriptAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public topic!: string;
  public platform!: string;
  public duration!: string;
  public tone!: string;
  public aiOutput!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Script.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
  },
  {
    sequelize,
    tableName: 'scripts',
  }
);

export default Script;
