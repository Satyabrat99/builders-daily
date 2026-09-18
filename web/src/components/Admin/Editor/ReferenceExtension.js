import { Node } from '@tiptap/core';

export const ReferenceNode = Node.create({
  name: 'reference',
  group: 'inline',
  inline: true,
  addAttributes() {
    return {
      targetId: { default: null },
      label: { default: 'Reference' }
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-type="reference"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-type': 'reference', class: 'reference-node', 'data-target': HTMLAttributes.targetId, style: 'color: #3b82f6; text-decoration: underline; cursor: pointer;' }, HTMLAttributes.label]
  }
});
