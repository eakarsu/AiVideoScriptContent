import AIReport from './AIReport';

interface AIOutputDisplayProps {
  content: string;
  title?: string;
}

// Both generated results and saved details use the same structured renderer.
export default function AIOutputDisplay({ content, title = 'AI Generated Content' }: AIOutputDisplayProps) {
  return <AIReport response={content} title={title} model={undefined} tokens={undefined} loading={undefined} error={undefined} />;
}
