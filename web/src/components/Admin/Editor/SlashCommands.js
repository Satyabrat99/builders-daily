import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import CommandList from './CommandList';
import { Heading1, Heading2, Code, CheckSquare, Table as TableIcon, Info, Play, Image as ImageIcon, MessageCircle, Code2, Quote } from 'lucide-react';
import { uploadImage } from '@/lib/uploadImage';

export const getSuggestionItems = ({ query }) => {
  return [
    {
      title: 'Heading 1',
      icon: Heading1,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      icon: Heading2,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Quote',
      icon: Quote,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: 'Code Block',
      icon: Code,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: 'Mermaid Diagram',
      icon: Code,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setCodeBlock({ language: 'mermaid' }).run();
      },
    },
    {
      title: 'Callout / Alert',
      icon: Info,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setCallout().run();
      },
    },
    {
      title: 'Task List',
      icon: CheckSquare,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Table',
      icon: TableIcon,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
    },
    {
      title: 'YouTube Video',
      icon: Play,
      command: ({ editor, range }) => {
        const url = prompt('Enter YouTube URL');
        if (url) {
          editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run();
        }
      },
    },
    {
      title: 'Image',
      icon: ImageIcon,
      command: ({ editor, range }) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
          if (input.files?.length) {
            const file = input.files[0];
            try {
              const url = await uploadImage(file);
              editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
            } catch (err) {
              console.error(err);
              alert('Failed to upload image');
            }
          }
        };
        input.click();
      },
    },
    {
      title: 'Twitter / X',
      icon: MessageCircle,
      command: ({ editor, range }) => {
        const url = prompt('Enter Tweet URL');
        if (url) {
          const match = url.match(/\/status\/(\d+)/);
          const id = match ? match[1] : url;
          editor.chain().focus().deleteRange(range).setTweet({ id }).run();
        }
      },
    },
    {
      title: 'GitHub Gist',
      icon: Code2,
      command: ({ editor, range }) => {
        const url = prompt('Enter Gist ID or URL');
        if (url) {
          const match = url.match(/gist\.github\.com\/[^\/]+\/([a-f0-9]+)/);
          const id = match ? match[1] : url;
          editor.chain().focus().deleteRange(range).setGist({ id }).run();
        }
      },
    },
  ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
};

export default function renderItems() {
  let component;
  let popup;

  return {
    onStart: props => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) return;

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        arrow: false,
        theme: 'builder',
      });
    },
    onUpdate: props => {
      component.updateProps(props);
      if (!props.clientRect) return;
      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },
    onKeyDown: props => {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }
      return component.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup[0].destroy();
      component.destroy();
    },
  };
}
