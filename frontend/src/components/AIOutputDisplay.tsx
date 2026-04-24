import { useState } from 'react';

interface AIOutputDisplayProps {
  content: string;
  title?: string;
}

export default function AIOutputDisplay({ content, title = 'AI Generated Content' }: AIOutputDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const sections: Array<{ type: 'header' | 'subheader' | 'list' | 'text' | 'score' | 'divider'; content: string }> = [];

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        sections.push({ type: 'divider', content: '' });
      } else if (trimmed.match(/^#{1,2}\s/) || trimmed.match(/^\*\*[A-Z][^*]+\*\*:?$/)) {
        sections.push({ type: 'header', content: trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '') });
      } else if (trimmed.match(/^#{3,}\s/) || trimmed.match(/^\*\*[^*]+\*\*:/) || trimmed.match(/^[A-Z][A-Z\s]+:/)) {
        sections.push({ type: 'subheader', content: trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '') });
      } else if (trimmed.match(/^[\d]+\.\s/) || trimmed.match(/^[-•]\s/) || trimmed.match(/^[*]\s/)) {
        sections.push({ type: 'list', content: trimmed.replace(/^[\d]+\.\s*/, '').replace(/^[-•*]\s*/, '') });
      } else if (trimmed.match(/VIRAL SCORE|SCORE:|Rating:/i) && trimmed.match(/\d+/)) {
        sections.push({ type: 'score', content: trimmed });
      } else {
        sections.push({ type: 'text', content: trimmed });
      }
    });

    return sections;
  };

  const sections = parseContent(content);

  const scoreMatch = content.match(/(?:VIRAL SCORE|SCORE|Rating)[:\s]*(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (s >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (s >= 40) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getScoreBarColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 60) return 'bg-amber-500';
    if (s >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-primary-600 to-violet-600 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-xs font-medium"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Score Display */}
      {score !== null && (
        <div className="px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl font-bold text-2xl border ${getScoreColor(score)}`}>
              {score}/100
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Viral Potential Score</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {score >= 80 ? 'Excellent potential!' : score >= 60 ? 'Good potential' : score >= 40 ? 'Moderate potential' : 'Needs improvement'}
              </p>
            </div>
            <div className="w-32">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-4 max-h-[500px] overflow-y-auto bg-white">
        <div className="space-y-2.5">
          {sections.map((section, idx) => {
            switch (section.type) {
              case 'header':
                return (
                  <h3 key={idx} className="text-base font-bold text-gray-900 pt-3 first:pt-0 border-b border-gray-100 pb-2">
                    {section.content}
                  </h3>
                );
              case 'subheader':
                return (
                  <h4 key={idx} className="text-sm font-semibold text-primary-700 pt-2">
                    {section.content}
                  </h4>
                );
              case 'list':
                return (
                  <div key={idx} className="flex items-start gap-2.5 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
                  </div>
                );
              case 'score':
                return null;
              case 'divider':
                return <div key={idx} className="h-1.5" />;
              default:
                return (
                  <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                );
            }
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Generated by AI
        </div>
        <span>{new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}
