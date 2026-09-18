import { NodeViewWrapper } from '@tiptap/react';
import { Tweet } from 'react-tweet';

export default function TweetNodeView({ node }) {
  const { id } = node.attrs;
  if (!id) return null;
  
  return (
    <NodeViewWrapper className="tweet-wrapper" contentEditable={false}>
      <div className="tweetCardWrapper" style={{ pointerEvents: 'auto' }}>
        <div className="tweetCardInner">
          <Tweet id={id} />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
