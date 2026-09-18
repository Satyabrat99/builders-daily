import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import styles from './slashCommands.module.css';

const CommandList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  const selectItem = index => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  if (props.items.length === 0) {
    return null;
  }

  return (
    <div className={styles.commandList}>
      {props.items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            className={`${styles.commandItem} ${index === selectedIndex ? styles.selected : ''}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <span className={styles.iconWrapper}><Icon size={14} /></span>
            {item.title}
          </button>
        );
      })}
    </div>
  );
});

CommandList.displayName = 'CommandList';
export default CommandList;
