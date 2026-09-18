import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const BlockDeleteExtension = Extension.create({
  name: 'blockDelete',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockDeletePlugin'),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, set) {
            return set.map(tr.mapping, tr.doc);
          }
        },
        props: {
          decorations(state) {
            const decorations = [];
            state.doc.descendants((node, pos) => {
              if (['codeBlock', 'table', 'callout', 'tweet', 'gist'].includes(node.type.name)) {
                decorations.push(
                  Decoration.widget(pos + 1, (view) => {
                    const dom = document.createElement('div');
                    dom.className = 'block-delete-container';
                    dom.setAttribute('contenteditable', 'false');
                    
                    const btn = document.createElement('button');
                    btn.className = 'block-delete-btn';
                    btn.innerHTML = '×';
                    btn.title = `Delete ${node.type.name}`;
                    
                    btn.addEventListener('click', (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const tr = view.state.tr.delete(pos, pos + node.nodeSize);
                      view.dispatch(tr);
                      setTimeout(() => {
                        view.focus();
                      }, 10);
                    });
                    
                    dom.appendChild(btn);
                    return dom;
                  }, { side: -1, ignoreSelection: true })
                );
              }
            });
            return DecorationSet.create(state.doc, decorations);
          },
          handleKeyDown(view, event) {
            if (event.key === 'Backspace' || event.key === 'Delete') {
              const { selection } = view.state;
              
              // 1. If it's a NodeSelection (the entire block is selected)
              if (selection.node && ['codeBlock', 'table', 'callout', 'tweet', 'gist'].includes(selection.node.type.name)) {
                event.preventDefault();
                const tr = view.state.tr.delete(selection.from, selection.to);
                view.dispatch(tr);
                return true;
              }

              // 2. If it's a TextSelection, check if cursor is at the very beginning of a codeBlock
              if (selection.empty) {
                const $from = selection.$from;
                const parent = $from.parent;
                
                if (parent.type.name === 'codeBlock' && $from.parentOffset === 0) {
                  if (event.key === 'Backspace') {
                    event.preventDefault();
                    const startPos = $from.before();
                    const endPos = $from.after();
                    const tr = view.state.tr.delete(startPos, endPos);
                    view.dispatch(tr);
                    return true;
                  }
                }
              }
            }
            return false;
          }
        }
      })
    ];
  }
});
