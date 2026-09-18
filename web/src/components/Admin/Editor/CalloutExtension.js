import { Node, mergeAttributes } from '@tiptap/core';

export const Callout = Node.create({
  name: 'callout',

  group: 'block',

  content: 'inline*',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'callout-block',
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'div.callout-block' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setCallout: () => ({ commands }) => {
        return commands.setNode(this.name)
      },
      toggleCallout: () => ({ commands }) => {
        return commands.toggleNode(this.name, 'paragraph')
      },
    }
  },
})
