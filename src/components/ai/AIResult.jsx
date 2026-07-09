import ReactMarkdown from 'react-markdown';
import { Sparkles } from 'lucide-react';

export default function AIResult({ result }) {
  if (!result) return null;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-primary" /><h2 className="font-semibold text-foreground">AI Response</h2></div>
      <ReactMarkdown className="prose prose-sm max-w-none text-foreground">{result}</ReactMarkdown>
    </div>
  );
}