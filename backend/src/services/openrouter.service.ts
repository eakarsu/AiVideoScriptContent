import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface GenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const generateAIContent = async (options: GenerateOptions): Promise<string> => {
  const { prompt, maxTokens = 2000, temperature = 0.7 } = options;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Content Creator',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenRouter API error:', errorData);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json() as OpenRouterResponse;
  return data.choices[0]?.message?.content || 'No content generated';
};

// Feature-specific generation functions
export const generateScript = async (topic: string, platform: string, duration: string, tone: string): Promise<string> => {
  const prompt = `Generate a complete video script for the following:
Topic: ${topic}
Platform: ${platform}
Duration: ${duration}
Tone: ${tone}

Include: Hook, intro, main content sections, transitions, call-to-action, and outro.`;
  return generateAIContent({ prompt });
};

export const generateTitle = async (topic: string, platform: string, style: string): Promise<string> => {
  const prompt = `Generate 5 catchy video titles for:
Topic: ${topic}
Platform: ${platform}
Style: ${style}

Make them attention-grabbing, clickable, and optimized for the platform.`;
  return generateAIContent({ prompt });
};

export const generateDescription = async (videoTitle: string, topic: string, platform: string): Promise<string> => {
  const prompt = `Generate an SEO-optimized video description for:
Title: ${videoTitle}
Topic: ${topic}
Platform: ${platform}

Include: Summary, timestamps, relevant links sections, and hashtags.`;
  return generateAIContent({ prompt });
};

export const generateHashtags = async (topic: string, platform: string, niche: string, count: number): Promise<string> => {
  const prompt = `Generate ${count} relevant hashtags for:
Topic: ${topic}
Platform: ${platform}
Niche: ${niche}

Include a mix of popular, niche, and trending hashtags.`;
  return generateAIContent({ prompt });
};

export const generateThumbnailIdeas = async (videoTitle: string, topic: string, style: string): Promise<string> => {
  const prompt = `Generate detailed thumbnail concept ideas for:
Video Title: ${videoTitle}
Topic: ${topic}
Style: ${style}

Include: Visual elements, text overlay suggestions, color schemes, and composition tips.`;
  return generateAIContent({ prompt });
};

export const generateHooks = async (topic: string, platform: string, hookType: string): Promise<string> => {
  const prompt = `Generate 5 attention-grabbing hooks for:
Topic: ${topic}
Platform: ${platform}
Hook Type: ${hookType}

Make them impossible to scroll past!`;
  return generateAIContent({ prompt });
};

export const generateContentCalendar = async (niche: string, platform: string, frequency: string, duration: string): Promise<string> => {
  const prompt = `Create a content calendar for:
Niche: ${niche}
Platform: ${platform}
Posting Frequency: ${frequency}
Time Period: ${duration}

Include: Content themes, posting schedule, content types, and strategic timing.`;
  return generateAIContent({ prompt });
};

export const analyzeTrends = async (niche: string, platform: string, timeframe: string): Promise<string> => {
  const prompt = `Analyze current trends for:
Niche: ${niche}
Platform: ${platform}
Timeframe: ${timeframe}

Include: Trending topics, emerging formats, audience interests, and opportunities.`;
  return generateAIContent({ prompt });
};

export const generateCommentReply = async (comment: string, context: string, tone: string): Promise<string> => {
  const prompt = `Generate a thoughtful reply to this comment:
Comment: "${comment}"
Context: ${context}
Desired Tone: ${tone}

Make it engaging and encourage further interaction.`;
  return generateAIContent({ prompt });
};

export const generateIdeas = async (niche: string, platform: string, contentType: string): Promise<string> => {
  const prompt = `Brainstorm 10 content ideas for:
Niche: ${niche}
Platform: ${platform}
Content Type: ${contentType}

Include: Unique angles, trending topics, and evergreen content ideas.`;
  return generateAIContent({ prompt });
};

export const optimizeSEO = async (videoTitle: string, description: string, platform: string): Promise<string> => {
  const prompt = `Provide SEO optimization for:
Title: ${videoTitle}
Current Description: ${description}
Platform: ${platform}

Include: Keyword suggestions, title improvements, description optimization, and tag recommendations.`;
  return generateAIContent({ prompt });
};

export const analyzeAnalytics = async (platform: string, metricType: string, dataInput: string): Promise<string> => {
  const prompt = `Analyze these analytics and provide insights:
Platform: ${platform}
Metric Type: ${metricType}
Data: ${dataInput}

Include: Performance analysis, patterns, recommendations, and growth strategies.`;
  return generateAIContent({ prompt });
};

export const analyzeCompetitor = async (competitorName: string, platform: string, analysisType: string): Promise<string> => {
  const prompt = `Analyze this competitor:
Competitor: ${competitorName}
Platform: ${platform}
Analysis Type: ${analysisType}

Include: Content strategy, strengths/weaknesses, opportunities, and differentiation ideas.`;
  return generateAIContent({ prompt });
};

export const generatePersona = async (niche: string, platform: string, demographics: string): Promise<string> => {
  const prompt = `Create a detailed audience persona for:
Niche: ${niche}
Platform: ${platform}
Demographics: ${demographics}

Include: Demographics, psychographics, pain points, content preferences, and engagement patterns.`;
  return generateAIContent({ prompt });
};

export const repurposeContent = async (originalContent: string, sourcePlatform: string, targetPlatform: string): Promise<string> => {
  const prompt = `Repurpose this content:
Original Content: ${originalContent}
From: ${sourcePlatform}
To: ${targetPlatform}

Adapt the content for the target platform's format, audience, and best practices.`;
  return generateAIContent({ prompt });
};

// NEW AI FEATURES

export const generateCaptions = async (videoTitle: string, videoContent: string, platform: string, captionStyle: string, includeEmojis: boolean): Promise<string> => {
  const prompt = `Generate engaging video captions for:
Video Title: ${videoTitle}
Video Content/Description: ${videoContent}
Platform: ${platform}
Caption Style: ${captionStyle}
Include Emojis: ${includeEmojis ? 'Yes' : 'No'}

Please provide:
1. A compelling main caption (hook + description)
2. 3 alternative caption variations
3. Relevant hashtags for the platform
4. Best posting times suggestion

Format the output professionally with clear sections.`;
  return generateAIContent({ prompt });
};

export const generateCTA = async (videoTitle: string, contentType: string, platform: string, goal: string, targetAction: string): Promise<string> => {
  const prompt = `Create optimized Call-to-Action (CTA) suggestions for:
Video/Content Title: ${videoTitle}
Content Type: ${contentType}
Platform: ${platform}
Goal: ${goal}
Target Action: ${targetAction}

Please provide:
1. 5 different CTA variations (from subtle to direct)
2. Best placement recommendations (beginning, middle, end)
3. Verbal CTA scripts
4. On-screen text CTA suggestions
5. Psychology tips for each CTA

Format the output professionally with clear sections and examples.`;
  return generateAIContent({ prompt });
};

export const predictViralPotential = async (videoTitle: string, videoDescription: string, platform: string, niche: string, targetAudience: string): Promise<string> => {
  const prompt = `Analyze the viral potential of this content:
Video Title: ${videoTitle}
Description: ${videoDescription}
Platform: ${platform}
Niche: ${niche}
Target Audience: ${targetAudience}

Please provide a comprehensive viral analysis:

1. VIRAL SCORE: Rate 1-100 with justification
2. STRENGTHS: What makes this content shareable
3. WEAKNESSES: Potential barriers to virality
4. OPTIMIZATION TIPS: How to increase viral potential
5. TIMING RECOMMENDATIONS: Best posting time/day
6. HASHTAG STRATEGY: Recommended hashtags for maximum reach
7. HOOK ANALYSIS: Is the title attention-grabbing enough?
8. TREND ALIGNMENT: How well does it align with current trends
9. SHAREABILITY FACTORS: Why would viewers share this?
10. PREDICTED PERFORMANCE: Expected engagement range

Format with clear sections and actionable insights.`;
  return generateAIContent({ prompt, maxTokens: 2500 });
};

export const generateVideoSummary = async (videoTitle: string, videoTranscript: string, summaryLength: string, includeKeyPoints: boolean): Promise<string> => {
  const prompt = `Summarize this video content:
Video Title: ${videoTitle}
Transcript/Content: ${videoTranscript}
Summary Length: ${summaryLength}
Include Key Points: ${includeKeyPoints ? 'Yes' : 'No'}

Please provide:
1. EXECUTIVE SUMMARY: Main takeaways in ${summaryLength} format
${includeKeyPoints ? '2. KEY POINTS: Bullet-pointed main ideas\n3. TIMESTAMPS: Suggested timestamp markers\n4. QUOTABLE MOMENTS: Notable quotes or statements' : ''}
5. ACTION ITEMS: What viewers should do after watching
6. RELATED TOPICS: Suggestions for follow-up content

Format the output professionally for easy reading and sharing.`;
  return generateAIContent({ prompt, maxTokens: 2000 });
};

export const generatePodcastTranscript = async (podcastTitle: string, audioContent: string, outputFormat: string, includeTimestamps: boolean, includeSpeakerLabels: boolean): Promise<string> => {
  const prompt = `Process and enhance this podcast content:
Podcast Title: ${podcastTitle}
Audio Content/Notes: ${audioContent}
Output Format: ${outputFormat}
Include Timestamps: ${includeTimestamps ? 'Yes' : 'No'}
Include Speaker Labels: ${includeSpeakerLabels ? 'Yes' : 'No'}

Please provide:
1. FORMATTED TRANSCRIPT: Clean, readable transcript in ${outputFormat} format
${includeTimestamps ? '2. TIMESTAMPED SECTIONS: Major topic changes with timestamps' : ''}
${includeSpeakerLabels ? '3. SPEAKER IDENTIFICATION: Label different speakers clearly' : ''}
4. EPISODE SUMMARY: Brief overview of the episode
5. KEY TOPICS DISCUSSED: Main subjects covered
6. NOTABLE QUOTES: Standout moments worth highlighting
7. SHOW NOTES: Formatted for publishing
8. SEO DESCRIPTION: Optimized for podcast directories

Format professionally for easy publishing and sharing.`;
  return generateAIContent({ prompt, maxTokens: 3000 });
};
