'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export default function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className;
            
            if (isInline) {
              return (
                <code 
                  className="px-1.5 py-0.5 rounded bg-primary/20 text-primary-foreground text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            // Code block - add copy button
            const codeContent = String(children).replace(/\n$/, '');
            const language = match ? match[1] : 'text';
            
            return <CodeBlockWithCopy code={codeContent} language={language} />;
          },
          a({ href, children, ...props }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          ul({ children, ...props }) {
            return (
              <ul className="list-disc list-inside space-y-1 my-2" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="list-decimal list-inside space-y-1 my-2" {...props}>
                {children}
              </ol>
            );
          },
          li({ children, ...props }) {
            return (
              <li className="text-sm" {...props}>
                {children}
              </li>
            );
          },
          p({ children, ...props }) {
            return (
              <p className="my-2 leading-relaxed" {...props}>
                {children}
              </p>
            );
          },
          h1({ children, ...props }) {
            return (
              <h1 className="text-2xl font-bold my-4" {...props}>
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2 className="text-xl font-bold my-3" {...props}>
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3 className="text-lg font-semibold my-2" {...props}>
                {children}
              </h3>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote 
                className="border-l-4 border-primary/50 pl-4 italic my-2 text-muted-foreground"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Code block with copy button
function CodeBlockWithCopy({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-3">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/80 border-b border-zinc-700">
        <span className="text-xs text-zinc-400 uppercase font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 text-xs transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">ကူးယူပါပါ။</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>ကူးယူမည်။</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="rounded-b-lg text-sm"
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '0 0 0.5rem 0.5rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}