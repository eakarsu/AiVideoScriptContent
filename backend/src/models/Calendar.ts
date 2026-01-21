import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CalendarAttributes {
  id: number;
  userId: number;
  niche: string;
  platform: string;
  frequency: string;
  duration: string;
  goals: string;
  aiOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CalendarCreationAttributes extends Optional<CalendarAttributes, 'id'> {}

class Calendar extends Model<CalendarAttributes, CalendarCreationAttributes> implements CalendarAttributes {
  public id!: number;
  public userId!: number;
  public niche!: string;
  public platform!: string;
  public frequency!: string;
  public duration!: string;
  public goals!: string;
  public aiOutput!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Calendar.init(
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
    niche: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    frequency: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    goals: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
  },
  {
    sequelize,
    tableName: 'calendars',
  }
);

export default Calendar;
