"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface MarkdownRendererProps {
    content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    // Ensure content is a string
    if (!content) return null

    // Pre-process content to handle common list formats
    const processedContent = content
        // Ensure bullet points with "-", "*", "•" are recognized
        .replace(/^([ \t]*)[-*•]\s+/gm, '$1- ')
        // Ensure numbered lists are properly formatted
        .replace(/^([ \t]*)(\d+)\.\s+/gm, '$1$2. ')
        // Preserve multiple newlines as paragraph breaks
        .replace(/\n{3,}/g, '\n\n')

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                // Custom paragraph styling
                p: ({ children, ...props }) => (
                    <p className="mb-4 leading-7" {...props}>
                        {children}
                    </p>
                ),
                // Custom heading styling
                h1: ({ children, ...props }) => (
                    <h1 className="text-2xl font-bold mb-4 leading-7" {...props}>
                        {children}
                    </h1>
                ),
                h2: ({ children, ...props }) => (
                    <h2 className="text-xl font-bold mb-3 leading-7" {...props}>
                        {children}
                    </h2>
                ),
                h3: ({ children, ...props }) => (
                    <h3 className="text-lg font-bold mb-2 leading-7" {...props}>
                        {children}
                    </h3>
                ),
                // Custom ordered list styling
                ol: ({ children, ...props }) => (
                    <ol className="list-decimal ml-6 mb-4 leading-7" {...props}>
                        {children}
                    </ol>
                ),
                // Custom unordered list styling
                ul: ({ children, ...props }) => (
                    <ul className="list-disc ml-6 mb-4 leading-7" {...props}>
                        {children}
                    </ul>
                ),
                // Custom list item styling
                li: ({ children, ...props }) => (
                    <li className="mb-1 leading-7" {...props}>
                        {children}
                    </li>
                ),
                // Custom link styling
                a: ({ children, href, ...props }) => (
                    <a
                        href={href}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                    >
                        {children}
                    </a>
                ),
                // Custom text styling for better wrapping
                text: ({ children }) => (
                    <span className="break-words">
                        {children}
                    </span>
                ),
                // Handle line breaks
                br: () => <br className="mb-4" />,
            }}
        >
            {processedContent}
        </ReactMarkdown>
    )
}