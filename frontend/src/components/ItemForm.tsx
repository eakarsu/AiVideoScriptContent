import { useState } from 'react';
import { api } from '../services/api';
import AIOutputDisplay from './AIOutputDisplay';

interface Field {
  name: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface Feature {
  id: string;
  name: string;
  endpoint: string;
  fields: Field[];
  generateFields: string[];
}

interface ItemFormProps {
  feature: Feature;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: Record<string, any>;
}

// Example data for each feature to enable quick testing
const EXAMPLE_DATA: Record<string, Record<string, any>[]> = {
  scripts: [
    { title: 'Morning Routine Vlog', topic: '5 AM Morning Routine for Productivity', platform: 'YouTube', duration: '10 minutes', tone: 'Inspirational' },
    { title: 'Quick Cooking Tutorial', topic: 'How to Make Perfect Pasta in 5 Minutes', platform: 'TikTok', duration: '1 minute', tone: 'Casual' },
    { title: 'Tech Review', topic: 'iPhone 16 Pro Max Review - Is It Worth It?', platform: 'YouTube', duration: '15 minutes', tone: 'Professional' },
  ],
  titles: [
    { topic: 'How to Start a YouTube Channel in 2025', platform: 'YouTube', style: 'How-to', keywords: 'youtube, beginner, growth' },
    { topic: 'Morning Routine Secrets of Billionaires', platform: 'TikTok', style: 'Clickbait', keywords: 'morning, routine, success' },
    { topic: '10 AI Tools That Will Save You Hours', platform: 'Instagram', style: 'List', keywords: 'AI, productivity, tools' },
  ],
  descriptions: [
    { videoTitle: 'How I Built a $1M Business from Home', topic: 'Online business tips and strategies', platform: 'YouTube', includeLinks: true, includeCta: true },
    { videoTitle: 'Vegan Meal Prep for Beginners', topic: 'Easy vegan recipes and meal prep tips', platform: 'YouTube', includeLinks: false, includeCta: true },
    { videoTitle: 'Day in My Life as a Software Engineer', topic: 'Software engineering daily routine and tips', platform: 'Instagram', includeLinks: false, includeCta: false },
  ],
  hashtags: [
    { topic: 'Fitness and Home Workouts', platform: 'Instagram', niche: 'Fitness', count: 30 },
    { topic: 'DIY Home Decor Ideas', platform: 'TikTok', niche: 'Home Decor', count: 20 },
    { topic: 'Programming and Coding Tutorials', platform: 'YouTube', niche: 'Tech Education', count: 25 },
  ],
  thumbnails: [
    { videoTitle: 'I Tried the Hardest Diet for 30 Days', topic: 'Diet challenge transformation', style: 'Before/After', colorScheme: 'Red and yellow high contrast' },
    { videoTitle: '10 iPhone Hacks You Didn\'t Know', topic: 'iPhone tips and tricks', style: 'Bold', colorScheme: 'Apple white and blue' },
    { videoTitle: 'How I Make $10K/Month as a Freelancer', topic: 'Freelancing income strategies', style: 'Face Focus', colorScheme: 'Green money theme' },
  ],
  hooks: [
    { topic: 'How to lose weight without going to the gym', platform: 'YouTube', hookType: 'Question', targetEmotion: 'Curiosity' },
    { topic: 'The one habit that changed my life', platform: 'TikTok', hookType: 'Story', targetEmotion: 'Inspiration' },
    { topic: '99% of people don\'t know this productivity hack', platform: 'Instagram', hookType: 'Shock', targetEmotion: 'Curiosity' },
  ],
  captions: [
    { videoTitle: 'My Trip to Japan', videoContent: 'Exploring Tokyo, Kyoto temples, Japanese street food, and cherry blossom season', platform: 'Instagram', captionStyle: 'Storytelling', includeEmojis: true },
    { videoTitle: 'How to Learn Any Skill Fast', videoContent: 'Breaking down the science of accelerated learning using spaced repetition and active recall', platform: 'LinkedIn', captionStyle: 'Educational', includeEmojis: false },
    { videoTitle: 'Gym Fails Compilation', videoContent: 'Hilarious gym moments, workout mishaps, and funny reactions at the gym', platform: 'TikTok', captionStyle: 'Funny', includeEmojis: true },
  ],
  ctas: [
    { videoTitle: 'Complete Python Tutorial for Beginners', contentType: 'Video', platform: 'YouTube', goal: 'Subscribers', targetAction: 'Subscribe' },
    { videoTitle: 'New Collection Drop', contentType: 'Short', platform: 'Instagram', goal: 'Sales', targetAction: 'Click Link' },
    { videoTitle: 'Weekly Tech News Roundup', contentType: 'Video', platform: 'YouTube', goal: 'Engagement', targetAction: 'Like & Comment' },
  ],
  'viral-predictions': [
    { videoTitle: 'I Lived Like a Monk for 30 Days', videoDescription: 'I gave up social media, ate one meal a day, and meditated 4 hours daily to see how it would change my life. The results were shocking.', platform: 'YouTube', niche: 'Self Improvement', targetAudience: 'Young adults 18-30 interested in self-improvement' },
    { videoTitle: 'What $1 vs $1000 Sushi Looks Like', videoDescription: 'Comparing the cheapest sushi to the most expensive sushi in the world. From convenience store to 3-star Michelin restaurant.', platform: 'TikTok', niche: 'Food', targetAudience: 'Foodies and entertainment seekers' },
    { videoTitle: 'AI Will Replace These Jobs in 2025', videoDescription: 'A deep dive into which careers are most at risk from artificial intelligence and what you can do to future-proof yourself.', platform: 'YouTube', niche: 'Technology', targetAudience: 'Professionals worried about AI impact' },
  ],
  'video-summaries': [
    { videoTitle: 'The Psychology of Money - Full Summary', videoUrl: '', videoTranscript: 'The book discusses how people think about money differently based on their experiences. Key concepts include the role of luck vs skill in financial success, the importance of saving over earning, and how compounding works over time. The author emphasizes that financial success is not about what you know but how you behave.', summaryLength: 'Medium (2-3 paragraphs)', includeKeyPoints: true },
    { videoTitle: 'How SpaceX Landed Starship', videoUrl: '', videoTranscript: 'SpaceX achieved a historic milestone by successfully catching the Super Heavy booster with the launch tower chopstick arms. The Starship upper stage performed a controlled belly flop maneuver and engine relight for landing. This represents a major step toward rapid reusability of the largest rocket ever built.', summaryLength: 'Brief (1-2 sentences)', includeKeyPoints: false },
    { videoTitle: 'Complete React Tutorial 2025', videoUrl: '', videoTranscript: 'This tutorial covers React fundamentals including components, JSX, props, state management with useState and useReducer, side effects with useEffect, context API, React Router for navigation, and building a complete project from scratch. We also cover TypeScript integration and best practices.', summaryLength: 'Detailed (full summary)', includeKeyPoints: true },
  ],
  'podcast-transcripts': [
    { podcastTitle: 'The Future of AI with Sam Altman', podcastUrl: '', audioContent: 'Discussion about GPT-5 capabilities, the path to AGI, safety concerns in AI development, how AI will transform education and healthcare, and the economic impact of widespread AI adoption. Sam shares his vision for OpenAI and responds to criticism about AI safety.', outputFormat: 'Blog Post Style', includeTimestamps: true, includeSpeakerLabels: true },
    { podcastTitle: 'How I Built This: Airbnb', podcastUrl: '', audioContent: 'Brian Chesky tells the story of founding Airbnb from selling cereal boxes to fund the company, to getting rejected by investors, to becoming a $100B company. Key moments include the YCombinator experience, the first international expansion, and dealing with regulatory challenges.', outputFormat: 'Formatted with Headers', includeTimestamps: false, includeSpeakerLabels: true },
    { podcastTitle: 'Mindset Monday: Building Discipline', podcastUrl: '', audioContent: 'Tips for building discipline including starting small, habit stacking, removing friction, accountability partners, and the two-minute rule. The host shares personal experiences with overcoming procrastination and building a consistent morning routine over 6 months.', outputFormat: 'Social Media Ready', includeTimestamps: false, includeSpeakerLabels: false },
  ],
  calendar: [
    { niche: 'Personal Finance and Investing', platform: 'YouTube', frequency: '3x/week', duration: '1 month', goals: 'Grow subscribers to 10K and increase watch time' },
    { niche: 'Cooking and Recipe Videos', platform: 'TikTok', frequency: 'Daily', duration: '2 weeks', goals: 'Go viral with short-form cooking content' },
    { niche: 'Tech Reviews and Tutorials', platform: 'Multiple', frequency: '2x/week', duration: '3 months', goals: 'Build authority in tech niche across platforms' },
  ],
  trends: [
    { niche: 'Artificial Intelligence', platform: 'YouTube', timeframe: 'This week', region: 'United States' },
    { niche: 'Fitness and Wellness', platform: 'TikTok', timeframe: 'This month', region: 'Global' },
    { niche: 'Gaming', platform: 'YouTube', timeframe: 'Last 3 months', region: 'Europe' },
  ],
  comments: [
    { originalComment: 'This video changed my life! Can you make more content like this?', context: 'Productivity tips video', tone: 'Grateful', platform: 'YouTube' },
    { originalComment: 'I disagree with point #3, the data shows otherwise', context: 'Tech comparison review', tone: 'Professional', platform: 'YouTube' },
    { originalComment: 'LOL this is so relatable 😂', context: 'Daily life comedy skit', tone: 'Funny', platform: 'TikTok' },
  ],
  ideas: [
    { niche: 'Personal Finance', platform: 'YouTube', contentType: 'Educational', targetAudience: 'College students and young professionals' },
    { niche: 'Travel and Adventure', platform: 'TikTok', contentType: 'Vlog', targetAudience: 'Young travelers aged 20-35' },
    { niche: 'Programming and Web Development', platform: 'YouTube', contentType: 'Tutorial', targetAudience: 'Beginner to intermediate developers' },
  ],
  seo: [
    { videoTitle: 'How to Start Dropshipping in 2025 - Complete Beginner Guide', description: 'Learn how to build a profitable dropshipping business from scratch', platform: 'YouTube', targetKeywords: 'dropshipping, ecommerce, online business, shopify' },
    { videoTitle: 'Best Budget Smartphones Under $300', description: 'Top 5 affordable phones with great cameras and performance', platform: 'YouTube', targetKeywords: 'budget phone, cheap smartphone, best phone 2025' },
    { videoTitle: 'Quick Healthy Breakfast Ideas', description: 'Easy breakfast recipes ready in 5 minutes', platform: 'TikTok', targetKeywords: 'healthy breakfast, quick meals, easy recipes' },
  ],
  analytics: [
    { platform: 'YouTube', metricType: 'Views', dataInput: 'Week 1: 5000 views, Week 2: 7500 views, Week 3: 12000 views, Week 4: 9000 views. Top video got 8000 views. Average CTR: 6.2%', timeframe: 'Last 30 days' },
    { platform: 'TikTok', metricType: 'Engagement', dataInput: 'Average likes: 500, Comments: 50, Shares: 200. Best performing: dance challenge with 50K views. Worst: product review with 1K views', timeframe: 'Last 7 days' },
    { platform: 'Instagram', metricType: 'Subscribers', dataInput: 'Started month: 5000 followers, End of month: 6200 followers. Best growth from Reels. Stories average 800 views. Posts average 300 likes', timeframe: 'Last 30 days' },
  ],
  competitors: [
    { competitorName: 'MrBeast', competitorUrl: '', platform: 'YouTube', analysisType: 'Content Strategy' },
    { competitorName: 'Charli D\'Amelio', competitorUrl: '', platform: 'TikTok', analysisType: 'Engagement' },
    { competitorName: 'Gary Vee', competitorUrl: '', platform: 'Instagram', analysisType: 'Full Analysis' },
  ],
  personas: [
    { niche: 'Personal Finance and Investing', platform: 'YouTube', demographics: 'Age 25-40, college educated', interests: 'Stocks, crypto, real estate, side hustles' },
    { niche: 'Beauty and Skincare', platform: 'Instagram', demographics: 'Women 18-35', interests: 'Skincare routines, makeup tutorials, product reviews' },
    { niche: 'Gaming and Esports', platform: 'Multiple', demographics: 'Age 15-30, predominantly male', interests: 'FPS games, streaming, gaming hardware' },
  ],
  repurpose: [
    { originalContent: 'In this 20-minute YouTube video, I explain the 5 key principles of investing: start early, diversify, keep costs low, stay the course, and reinvest dividends. Each principle is backed by data showing how a $10K investment grows differently based on these strategies over 30 years.', sourcePlatform: 'YouTube', targetPlatform: 'Twitter', contentType: 'Thread' },
    { originalContent: 'Today I shared my complete morning routine: wake up at 5 AM, 20 min meditation, cold shower, journaling for 10 min, healthy breakfast, then deep work for 2 hours before checking email. This routine doubled my productivity.', sourcePlatform: 'Blog', targetPlatform: 'TikTok', contentType: 'Video Script' },
    { originalContent: 'Our latest podcast episode covered the future of remote work, including how AI tools are changing collaboration, the rise of async communication, and why companies that embrace hybrid work will win the talent war.', sourcePlatform: 'Podcast', targetPlatform: 'LinkedIn', contentType: 'Social Post' },
  ],
};

export default function ItemForm({ feature, onSave, onCancel, initialData }: ItemFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
  const [aiOutput, setAiOutput] = useState(initialData?.aiOutput || '');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const examples = EXAMPLE_DATA[feature.id] || [];

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loadExample = (exampleIndex: number) => {
    if (examples[exampleIndex]) {
      setFormData({ ...examples[exampleIndex] });
      setAiOutput('');
      setError('');
    }
  };

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);

    try {
      const generateData: Record<string, any> = {};
      feature.generateFields.forEach((field) => {
        if (formData[field] !== undefined) {
          generateData[field] = formData[field];
        }
      });

      const response = await api.post(`${feature.endpoint}/generate`, generateData);
      setAiOutput(response.data.aiOutput);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!aiOutput && !initialData) {
      setError('Please generate content first');
      return;
    }

    setError('');
    setSaving(true);

    try {
      await onSave({ ...formData, aiOutput: aiOutput || formData.aiOutput });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const canGenerate = feature.generateFields.every(
    (field) => {
      const fieldConfig = feature.fields.find(f => f.name === field);
      if (fieldConfig?.type === 'checkbox') {
        return true;
      }
      return formData[field] !== undefined && formData[field] !== '' && String(formData[field]).trim() !== '';
    }
  );

  // Generate short labels for example buttons
  const getExampleLabel = (example: Record<string, any>, index: number) => {
    const titleField = example.title || example.topic || example.videoTitle || example.podcastTitle || example.niche || example.competitorName || example.originalComment || example.originalContent;
    if (titleField) {
      const label = String(titleField);
      return label.length > 30 ? label.substring(0, 30) + '...' : label;
    }
    return `Example ${index + 1}`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Example Data Buttons */}
      {examples.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-violet-50 border border-primary-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium text-primary-700">Load example data to test AI</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(idx)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary-200 rounded-lg text-xs font-medium text-primary-700
                           hover:bg-primary-50 hover:border-primary-300 transition-all shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {getExampleLabel(example, idx)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feature.fields.map((field) => (
          <div
            key={field.name}
            className={field.type === 'textarea' ? 'md:col-span-2' : ''}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'select' ? (
              <select
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="input-field"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="input-field h-24 resize-none"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            ) : field.type === 'checkbox' ? (
              <label className="flex items-center gap-2.5 mt-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData[field.name] || false}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="w-4.5 h-4.5 text-primary-600 rounded-md border-gray-300 focus:ring-primary-500"
                  />
                </div>
                <span className="text-sm text-gray-600">Enable</span>
              </label>
            ) : field.type === 'number' ? (
              <input
                type="number"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, parseInt(e.target.value) || '')}
                className="input-field"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            ) : (
              <input
                type="text"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="input-field"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <div className="flex flex-col items-center gap-2 py-2">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || generating}
          className={`px-8 py-3.5 rounded-xl font-semibold text-base transition-all ${
            canGenerate && !generating
              ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white hover:from-primary-700 hover:to-violet-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating with AI...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate with AI
            </span>
          )}
        </button>
        {!canGenerate && (
          <p className="text-xs text-gray-400">Fill in required fields to enable generation</p>
        )}
      </div>

      {/* AI Output */}
      {aiOutput && (
        <AIOutputDisplay content={aiOutput} title={`Generated ${feature.name}`} />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={(!aiOutput && !initialData) || saving}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
            (aiOutput || initialData) && !saving
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
