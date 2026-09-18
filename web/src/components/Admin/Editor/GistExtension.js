import { Node, mergeAttributes } from '@tiptap/core';
import { nodePasteRule } from '@tiptap/core';

export const GistExtension = Node.create({
  name: 'gist',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-gist-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-gist-id': HTMLAttributes.id })];
  },

  addCommands() {
    return {
      setGist:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: /https?:\/\/gist\.github\.com\/[^\/]+\/([a-f0-9]+)/g,
        type: this.type,
        getAttributes: (match) => {
          return { id: match[1] };
        },
      }),
    ];
  },
});
