"use client";
import { useEffect, useRef, useMemo } from 'react';
import mermaid from 'mermaid';
import 'highlight.js/styles/github.css'; // Light theme default
import './syntax-theme.css'; // Dark theme overrides

import parse, { domToReact } from 'html-react-parser';
import { Tweet } from 'react-tweet';
import GistEmbed from './GistEmbed';
import CodeBlock from './CodeBlock';

function groupConsecutiveTweets(html) {
  if (!html || typeof html !== 'string') return html;

  // Pattern matches 2 or more consecutive tweet divs, allowing whitespace and empty paragraphs (br, &nbsp;) between them
  const regex = /(?:<div\s+[^>]*data-twitter-id="[^"]*"[^>]*>(?:<\/div>)?\s*(?:<p[^>]*>(?:\s|&nbsp;|<br[^>]*>)*<\/p>\s*)*){2,}/gi;

  return html.replace(regex, (match) => {
    const tweetDivs = match.match(/<div\s+[^>]*data-twitter-id="[^"]*"[^>]*>(?:<\/div>)?/gi) || [];
    if (tweetDivs.length < 2) return match;
    const count = tweetDivs.length;
    const normalizedDivs = tweetDivs.map(d => d.endsWith('</div>') ? d : d + '</div>').join('');
    return `<div class="tweetGrid" data-count="${count}">${normalizedDivs}</div>`;
  });
}

export default function RichTextRenderer({ htmlContent }) {
  const containerRef = useRef(null);
  const processedHtml = useMemo(() => groupConsecutiveTweets(htmlContent), [htmlContent]);

  useEffect(() => {
    if (!containerRef.current) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      fontFamily: 'inherit',
    });

    const renderMermaid = async () => {
      const elements = containerRef.current.querySelectorAll('pre code.language-mermaid');
      
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const graphDefinition = el.textContent;
        const pre = el.parentElement;

        try {
          const id = `mermaid-${Math.random().toString(36).substring(7)}`;
          const { svg } = await mermaid.render(id, graphDefinition);
          
          const svgContainer = document.createElement('div');
          svgContainer.innerHTML = svg;
          svgContainer.style.display = 'flex';
          svgContainer.style.justifyContent = 'center';
          svgContainer.style.margin = '2rem 0';
          
          pre.replaceWith(svgContainer);
        } catch (error) {
          console.error("Failed to render mermaid diagram", error);
        }
      }
    };

    renderMermaid();
  }, [processedHtml]);

  const options = {
    replace: (domNode) => {
      if (domNode.name === 'pre') {
        const codeNode = domNode.children?.find(child => child.name === 'code');
        if (codeNode && !codeNode.attribs?.class?.includes('language-mermaid')) {
          const language = codeNode.attribs?.class?.replace('language-', '') || '';
          
          let rawText = '';
          const extractText = (node) => {
            if (node.type === 'text') rawText += node.data;
            if (node.children) node.children.forEach(extractText);
          };
          extractText(codeNode);
          
          return (
            <CodeBlock 
              language={language} 
              codeReact={domToReact(codeNode.children, options)} 
              rawText={rawText} 
            />
          );
        }
      }
      if (domNode.name === 'table') {
        return (
          <div className="tableWrapper">
            <table>
              {domToReact(domNode.children, options)}
            </table>
          </div>
        );
      }
      if (domNode.attribs && domNode.attribs['data-twitter-id']) {
        const isInsideGrid = domNode.parent?.attribs?.class?.includes('tweetGrid');
        if (isInsideGrid) {
          return (
            <div className="tweetCardInner">
              <Tweet id={domNode.attribs['data-twitter-id']} />
            </div>
          );
        }
        return (
          <div className="tweetCardWrapper">
            <div className="tweetCardInner singleTweet">
              <Tweet id={domNode.attribs['data-twitter-id']} />
            </div>
          </div>
        );
      }
      if (domNode.attribs && domNode.attribs['data-gist-id']) {
        return (
          <div className="gistCardWrapper">
            <GistEmbed id={domNode.attribs['data-gist-id']} />
          </div>
        );
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="rich-text-content"
    >
      {parse(processedHtml, options)}
    </div>
  );
}
