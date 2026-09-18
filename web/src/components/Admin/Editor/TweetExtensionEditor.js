import { ReactNodeViewRenderer } from '@tiptap/react';
import TweetNodeView from './TweetNodeView';
import { TweetExtension } from './TweetExtension';

export const TweetExtensionEditor = TweetExtension.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TweetNodeView);
  },
});
