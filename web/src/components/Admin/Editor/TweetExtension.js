import { Node, mergeAttributes } from '@tiptap/core';
import { nodePasteRule } from '@tiptap/core';

export const TweetExtension = Node.create({
  name: 'tweet',
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
        tag: 'div[data-twitter-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-twitter-id': HTMLAttributes.id })];
  },

  addCommands() {
    return {
      setTweet:
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
        find: /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/g,
        type: this.type,
        getAttributes: (match) => {
          return { id: match[1] };
        },
      }),
    ];
  },
});
