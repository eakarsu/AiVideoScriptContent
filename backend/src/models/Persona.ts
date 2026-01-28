import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PersonaAttributes {
  id: number;
  userId: number;
  niche: string;
  platform: string;
  demographics: string;
  interests: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PersonaCreationAttributes extends Optional<PersonaAttributes, 'id'> {}

class Persona extends Model<PersonaAttributes, PersonaCreationAttributes> implements PersonaAttributes {
  public id!: number;
  public userId!: number;
  public niche!: string;
  public platform!: string;
  public demographics!: string;
  public interests!: string;
  public aiOutput!: string;
  public status!: 'draft' | 'scheduled' | 'published';
  public scheduledAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Persona.init(
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
    demographics: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    interests: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'personas',
  }
);

export default Persona;
