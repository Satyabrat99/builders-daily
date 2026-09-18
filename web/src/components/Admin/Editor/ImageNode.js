import { NodeViewWrapper } from '@tiptap/react';
import { Trash2, RefreshCcw } from 'lucide-react';
import { uploadImage } from '@/lib/uploadImage';
import { useState } from 'react';
import styles from '../blogEditor.module.css';

export default function ImageNode({ node, updateAttributes, deleteNode }) {
  const { src, alt } = node.attrs;
  const [uploading, setUploading] = useState(false);

  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const url = await uploadImage(file);
        updateAttributes({ src: url });
      } catch (error) {
        console.error('Failed to replace image', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const id = `replace-${Math.random().toString(36).substr(2, 9)}`;

  const handleAltChange = (e) => {
    updateAttributes({ alt: e.target.value });
  };

  return (
    <NodeViewWrapper className={styles.imageNodeWrapper}>
      <div className={styles.imageNodeInner}>
        <img 
          src={src} 
          alt={alt} 
          className={`${styles.imageNodeImg} ${uploading ? styles.uploading : ''}`} 
        />
        <div className={styles.imageNodeActions}>
          <label htmlFor={id} className={styles.imageNodeBtn} title="Replace image">
            <RefreshCcw size={16} />
          </label>
          <input 
            id={id} 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleReplace} 
          />
          
          <button 
            type="button"
            className={`${styles.imageNodeBtn} ${styles.dangerBtn}`} 
            onClick={deleteNode} 
            title="Remove image"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className={styles.imageAltWrapper} contentEditable={false}>
        <input 
          type="text"
          placeholder="Write alt text for image SEO..."
          value={alt || ''}
          onChange={handleAltChange}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={styles.imageAltInput}
        />
      </div>
    </NodeViewWrapper>
  );
}
