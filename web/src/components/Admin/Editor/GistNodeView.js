import { NodeViewWrapper } from '@tiptap/react';
import Gist from 'react-gist';

export default function GistNodeView({ node }) {
  const { id } = node.attrs;
  if (!id) return null;

  return (
    <NodeViewWrapper className="gist-wrapper" contentEditable={false}>
      <div style={{ pointerEvents: 'auto', margin: '24px 0' }}>
        <Gist id={id} />
      </div>
    </NodeViewWrapper>
  );
}
