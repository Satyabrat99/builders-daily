export default function Divider({ margin = '20px 0', color = 'var(--border)' }) {
  return (
    <div 
      style={{
        width: '100%',
        height: '1px',
        backgroundColor: color,
        margin: margin,
      }} 
    />
  );
}
