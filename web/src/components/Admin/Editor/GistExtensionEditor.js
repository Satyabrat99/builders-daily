import { ReactNodeViewRenderer } from '@tiptap/react';
import GistNodeView from './GistNodeView';
import { GistExtension } from './GistExtension';

export const GistExtensionEditor = GistExtension.extend({
  addNodeView() {
    return ReactNodeViewRenderer(GistNodeView);
  },
});
