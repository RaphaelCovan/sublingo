import React from 'react';

interface SubtitleOverlayProps {
  primaryText: string;
  secondaryText: string;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ primaryText, secondaryText }) => {
  if (!primaryText && !secondaryText) return null;

  return (
    <div style={{
      padding: '16px 32px',
      background: 'rgba(8, 8, 8, 0.85)', // Slightly darker
      color: 'white',
      borderRadius: '16px',
      textAlign: 'center',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.1)',
      maxWidth: '80vw', // Don't let it get too wide
      transition: 'all 0.1s ease-out',
    }}>
      {/* Primary (Original) Language */}
      <div 
        style={{ 
          fontSize: '28px', 
          fontWeight: '600', 
          lineHeight: '1.2',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}
        dangerouslySetInnerHTML={{ __html: primaryText }}
      />
      
      {/* Secondary (Learning) Language */}
      {secondaryText && (
        <div 
          style={{ 
            fontSize: '20px', 
            color: '#FFD700', // Gold color for the learning track (very readable)
            marginTop: '8px',
            fontWeight: '400',
            opacity: 0.9,
            lineHeight: '1.2'
          }}
          dangerouslySetInnerHTML={{ __html: secondaryText }}
        />
      )}
    </div>
  );
};

export default SubtitleOverlay;