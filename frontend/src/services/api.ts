const API_BASE_URL = '/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { response: { data: error } };
    }

    return { data: await response.json() };
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { response: { data: error } };
    }

    return { data: await response.json() };
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { response: { data: error } };
    }

    return { data: await response.json() };
  }

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw { response: { data: error } };
    }

    return { data: await response.json() };
  }
}

export const api = new ApiService();

// Feature configuration
export const FEATURES = [
  {
    id: 'scripts',
    name: 'Script Generator',
    description: 'Generate full video scripts with AI',
    icon: '📝',
    color: 'bg-blue-500',
    endpoint: '/scripts',
    fields: [
      { name: 'title', label: 'Script Title', type: 'text', required: true },
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram'], required: true },
      { name: 'duration', label: 'Duration', type: 'select', options: ['30 seconds', '1 minute', '3 minutes', '5 minutes', '10 minutes', '15 minutes', '20+ minutes'], required: true },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Casual', 'Professional', 'Funny', 'Educational', 'Inspirational'], required: true },
    ],
    generateFields: ['topic', 'platform', 'duration', 'tone'],
    displayField: 'title',
    secondaryField: 'topic',
  },
  {
    id: 'titles',
    name: 'Title Generator',
    description: 'Create catchy, clickable titles',
    icon: '🎯',
    color: 'bg-green-500',
    endpoint: '/titles',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram'], required: true },
      { name: 'style', label: 'Style', type: 'select', options: ['Clickbait', 'Professional', 'Question', 'How-to', 'List'], required: true },
      { name: 'keywords', label: 'Keywords', type: 'text', required: false },
    ],
    generateFields: ['topic', 'platform', 'style'],
    displayField: 'topic',
    secondaryField: 'style',
  },
  {
    id: 'descriptions',
    name: 'Description Writer',
    description: 'SEO-optimized video descriptions',
    icon: '📋',
    color: 'bg-purple-500',
    endpoint: '/descriptions',
    fields: [
      { name: 'videoTitle', label: 'Video Title', type: 'text', required: true },
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram'], required: true },
      { name: 'includeLinks', label: 'Include Links Section', type: 'checkbox', required: false },
      { name: 'includeCta', label: 'Include Call-to-Action', type: 'checkbox', required: false },
    ],
    generateFields: ['videoTitle', 'topic', 'platform'],
    displayField: 'videoTitle',
    secondaryField: 'topic',
  },
  {
    id: 'hashtags',
    name: 'Hashtag Generator',
    description: 'Find trending hashtags',
    icon: '#️⃣',
    color: 'bg-pink-500',
    endpoint: '/hashtags',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['TikTok', 'Instagram', 'YouTube', 'Twitter'], required: true },
      { name: 'niche', label: 'Niche', type: 'text', required: true },
      { name: 'count', label: 'Number of Hashtags', type: 'number', required: false },
    ],
    generateFields: ['topic', 'platform', 'niche'],
    displayField: 'topic',
    secondaryField: 'niche',
  },
  {
    id: 'thumbnails',
    name: 'Thumbnail Ideas',
    description: 'AI thumbnail suggestions',
    icon: '🖼️',
    color: 'bg-yellow-500',
    endpoint: '/thumbnails',
    fields: [
      { name: 'videoTitle', label: 'Video Title', type: 'text', required: true },
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'style', label: 'Style', type: 'select', options: ['Minimal', 'Bold', 'Face Focus', 'Before/After', 'Text Heavy'], required: true },
      { name: 'colorScheme', label: 'Color Scheme', type: 'text', required: false },
    ],
    generateFields: ['videoTitle', 'topic', 'style'],
    displayField: 'videoTitle',
    secondaryField: 'style',
  },
  {
    id: 'hooks',
    name: 'Hook Generator',
    description: 'Attention-grabbing intros',
    icon: '🪝',
    color: 'bg-red-500',
    endpoint: '/hooks',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram'], required: true },
      { name: 'hookType', label: 'Hook Type', type: 'select', options: ['Question', 'Statement', 'Story', 'Shock', 'Promise'], required: true },
      { name: 'targetEmotion', label: 'Target Emotion', type: 'select', options: ['Curiosity', 'Fear', 'Excitement', 'Inspiration', 'Humor'], required: false },
    ],
    generateFields: ['topic', 'platform', 'hookType'],
    displayField: 'topic',
    secondaryField: 'hookType',
  },
  {
    id: 'calendar',
    name: 'Content Calendar',
    description: 'AI content planning',
    icon: '📅',
    color: 'bg-indigo-500',
    endpoint: '/calendar',
    fields: [
      { name: 'niche', label: 'Niche', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram', 'Multiple'], required: true },
      { name: 'frequency', label: 'Posting Frequency', type: 'select', options: ['Daily', '3x/week', '2x/week', 'Weekly'], required: true },
      { name: 'duration', label: 'Planning Duration', type: 'select', options: ['1 week', '2 weeks', '1 month', '3 months'], required: true },
      { name: 'goals', label: 'Goals', type: 'textarea', required: false },
    ],
    generateFields: ['niche', 'platform', 'frequency', 'duration'],
    displayField: 'niche',
    secondaryField: 'frequency',
  },
  {
    id: 'trends',
    name: 'Trend Analyzer',
    description: 'Analyze current trends',
    icon: '📈',
    color: 'bg-orange-500',
    endpoint: '/trends',
    fields: [
      { name: 'niche', label: 'Niche', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram', 'Twitter'], required: true },
      { name: 'timeframe', label: 'Timeframe', type: 'select', options: ['This week', 'This month', 'Last 3 months'], required: true },
      { name: 'region', label: 'Region', type: 'text', required: false },
    ],
    generateFields: ['niche', 'platform', 'timeframe'],
    displayField: 'niche',
    secondaryField: 'timeframe',
  },
  {
    id: 'comments',
    name: 'Comment Responder',
    description: 'AI reply suggestions',
    icon: '💬',
    color: 'bg-teal-500',
    endpoint: '/comments',
    fields: [
      { name: 'originalComment', label: 'Original Comment', type: 'textarea', required: true },
      { name: 'context', label: 'Video Context', type: 'text', required: false },
      { name: 'tone', label: 'Response Tone', type: 'select', options: ['Friendly', 'Professional', 'Funny', 'Grateful', 'Informative'], required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram'], required: true },
    ],
    generateFields: ['originalComment', 'tone'],
    displayField: 'originalComment',
    secondaryField: 'tone',
  },
  {
    id: 'ideas',
    name: 'Video Ideas',
    description: 'Content brainstorming',
    icon: '💡',
    color: 'bg-amber-500',
    endpoint: '/ideas',
    fields: [
      { name: 'niche', label: 'Niche', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram', 'Multiple'], required: true },
      { name: 'contentType', label: 'Content Type', type: 'select', options: ['Tutorial', 'Entertainment', 'Vlog', 'Review', 'Educational'], required: true },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', required: false },
    ],
    generateFields: ['niche', 'platform', 'contentType'],
    displayField: 'niche',
    secondaryField: 'contentType',
  },
  {
    id: 'seo',
    name: 'SEO Optimizer',
    description: 'Keyword optimization',
    icon: '🔍',
    color: 'bg-lime-500',
    endpoint: '/seo',
    fields: [
      { name: 'videoTitle', label: 'Video Title', type: 'text', required: true },
      { name: 'description', label: 'Current Description', type: 'textarea', required: false },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram'], required: true },
      { name: 'targetKeywords', label: 'Target Keywords', type: 'text', required: false },
    ],
    generateFields: ['videoTitle', 'platform'],
    displayField: 'videoTitle',
    secondaryField: 'platform',
  },
  {
    id: 'analytics',
    name: 'Analytics Insights',
    description: 'AI insights from metrics',
    icon: '📊',
    color: 'bg-cyan-500',
    endpoint: '/analytics',
    fields: [
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram'], required: true },
      { name: 'metricType', label: 'Metric Type', type: 'select', options: ['Views', 'Engagement', 'Subscribers', 'Revenue', 'Watch Time'], required: true },
      { name: 'dataInput', label: 'Your Data', type: 'textarea', required: true },
      { name: 'timeframe', label: 'Timeframe', type: 'select', options: ['Last 7 days', 'Last 30 days', 'Last 90 days'], required: true },
    ],
    generateFields: ['platform', 'metricType', 'dataInput'],
    displayField: 'metricType',
    secondaryField: 'platform',
  },
  {
    id: 'competitors',
    name: 'Competitor Analysis',
    description: 'Analyze competitors',
    icon: '🏆',
    color: 'bg-rose-500',
    endpoint: '/competitors',
    fields: [
      { name: 'competitorName', label: 'Competitor Name/Channel', type: 'text', required: true },
      { name: 'competitorUrl', label: 'Competitor URL', type: 'text', required: false },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram'], required: true },
      { name: 'analysisType', label: 'Analysis Type', type: 'select', options: ['Content Strategy', 'Growth Analysis', 'Engagement', 'Thumbnail Style', 'Full Analysis'], required: true },
    ],
    generateFields: ['competitorName', 'platform', 'analysisType'],
    displayField: 'competitorName',
    secondaryField: 'analysisType',
  },
  {
    id: 'personas',
    name: 'Audience Personas',
    description: 'Target audience profiles',
    icon: '👥',
    color: 'bg-violet-500',
    endpoint: '/personas',
    fields: [
      { name: 'niche', label: 'Your Niche', type: 'text', required: true },
      { name: 'platform', label: 'Primary Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram', 'Multiple'], required: true },
      { name: 'demographics', label: 'Known Demographics', type: 'text', required: false },
      { name: 'interests', label: 'Audience Interests', type: 'text', required: false },
    ],
    generateFields: ['niche', 'platform'],
    displayField: 'niche',
    secondaryField: 'platform',
  },
  {
    id: 'repurpose',
    name: 'Content Repurposer',
    description: 'Adapt content for platforms',
    icon: '♻️',
    color: 'bg-emerald-500',
    endpoint: '/repurpose',
    fields: [
      { name: 'originalContent', label: 'Original Content', type: 'textarea', required: true },
      { name: 'sourcePlatform', label: 'Source Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram', 'Blog', 'Podcast'], required: true },
      { name: 'targetPlatform', label: 'Target Platform', type: 'select', options: ['YouTube', 'TikTok', 'Instagram', 'Twitter', 'LinkedIn', 'Blog'], required: true },
      { name: 'contentType', label: 'Content Type', type: 'select', options: ['Video Script', 'Blog Post', 'Social Post', 'Thread'], required: true },
    ],
    generateFields: ['originalContent', 'sourcePlatform', 'targetPlatform'],
    displayField: 'sourcePlatform',
    secondaryField: 'targetPlatform',
  },
];

export const getFeatureById = (id: string) => FEATURES.find(f => f.id === id);
