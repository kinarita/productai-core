"use client";

import ReactMarkdown from "react-markdown";

export function DiscussionMarkdown({ content }: { content: string }) {
  if (!content.trim()) return null;

  return (
    <div className="discussion-markdown text-sm text-foreground [&_p]:mt-1.5 [&_p:first-child]:mt-0 [&_strong]:font-semibold [&_ul]:mt-1.5 [&_ul]:list-inside [&_ul]:list-disc [&_ol]:mt-1.5 [&_ol]:list-inside [&_ol]:list-decimal [&_h3]:mt-2 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-muted">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
