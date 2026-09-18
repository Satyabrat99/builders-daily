import { Image } from '@tiptap/extension-image';
import { Plugin, PluginKey } from 'prosemirror-state';
import { uploadImage } from '@/lib/uploadImage';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageNode from './ImageNode';

export const ImageUploadExtension = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNode);
  },
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageDropPlugin'),
        props: {
          handleDrop(view, event, slice, moved) {
            if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
              const file = event.dataTransfer.files[0];
              const filesize = (file.size / 1024 / 1024).toFixed(4); // MB

              if ((file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif') && filesize < 10) {
                event.preventDefault();
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });

                uploadImage(file)
                  .then((url) => {
                    const node = view.state.schema.nodes.image.create({ src: url });
                    const transaction = view.state.tr.insert(coordinates.pos, node);
                    view.dispatch(transaction);
                  })
                  .catch(console.error);
                return true;
              }
            }
            return false;
          },
          handlePaste(view, event, slice) {
            const items = Array.from(event.clipboardData?.items || []);
            const { schema } = view.state;

            for (const item of items) {
              if (item.type.indexOf('image') === 0) {
                event.preventDefault();
                const file = item.getAsFile();

                uploadImage(file)
                  .then((url) => {
                    const node = schema.nodes.image.create({ src: url });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  })
                  .catch(console.error);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
