"use client";
import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import hljs from 'highlight.js/lib/common';
import styles from './CodeBlock.module.css';

export default function CodeBlock({ language, codeReact, rawText }) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        setHighlightedCode(hljs.highlight(rawText, { language, ignoreIllegals: true }).value);
      } else {
        setHighlightedCode(hljs.highlightAuto(rawText).value);
      }
    } catch (e) {
      console.error('Failed to highlight code', e);
      setHighlightedCode(rawText);
    }
  }, [rawText, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className={styles.wrapper}>
      {language && <div className={styles.language}>{language}</div>}
      <button 
        onClick={handleCopy} 
        className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
        title="Copy to clipboard"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre className={styles.pre}>
        {highlightedCode ? (
          <code 
            className={`hljs ${language ? `language-${language}` : ''}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          <code className={`hljs ${language ? `language-${language}` : ''}`}>
            {rawText}
          </code>
        )}
      </pre>
    </div>
  );
}
