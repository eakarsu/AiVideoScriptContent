import User from './User';
import Script from './Script';
import Title from './Title';
import Description from './Description';
import Hashtag from './Hashtag';
import Thumbnail from './Thumbnail';
import Hook from './Hook';
import Calendar from './Calendar';
import Trend from './Trend';
import Comment from './Comment';
import Idea from './Idea';
import Seo from './Seo';
import Analytics from './Analytics';
import Competitor from './Competitor';
import Persona from './Persona';
import Repurpose from './Repurpose';

// Set up associations
User.hasMany(Script, { foreignKey: 'userId', as: 'scripts' });
Script.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Title, { foreignKey: 'userId', as: 'titles' });
Title.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Description, { foreignKey: 'userId', as: 'descriptions' });
Description.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Hashtag, { foreignKey: 'userId', as: 'hashtags' });
Hashtag.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Thumbnail, { foreignKey: 'userId', as: 'thumbnails' });
Thumbnail.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Hook, { foreignKey: 'userId', as: 'hooks' });
Hook.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Calendar, { foreignKey: 'userId', as: 'calendars' });
Calendar.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Trend, { foreignKey: 'userId', as: 'trends' });
Trend.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Idea, { foreignKey: 'userId', as: 'ideas' });
Idea.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Seo, { foreignKey: 'userId', as: 'seoOptimizations' });
Seo.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Analytics, { foreignKey: 'userId', as: 'analytics' });
Analytics.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Competitor, { foreignKey: 'userId', as: 'competitors' });
Competitor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Persona, { foreignKey: 'userId', as: 'personas' });
Persona.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Repurpose, { foreignKey: 'userId', as: 'repurposes' });
Repurpose.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Script,
  Title,
  Description,
  Hashtag,
  Thumbnail,
  Hook,
  Calendar,
  Trend,
  Comment,
  Idea,
  Seo,
  Analytics,
  Competitor,
  Persona,
  Repurpose,
};
