import React from 'react';

interface SubtitleOverlayProps {
  primaryText: string;
  secondaryText: string;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ primaryText, secondaryText }) => {
  // If both are empty, don't show the box
  if (!primaryText && !secondaryText) return null;

  return (
    <div style={{
      padding: '12px 24px',
      background: 'rgba(0, 0, 0, 0.75)',
      color: 'white',
      borderRadius: '12px',
      textAlign: 'center',
      backdropFilter: 'blur(4px)', // Modern "Apple" style
      transition: 'all 0.2s ease',
    }}>
      {/* Primary Subtitle (Large) */}
      <div style={{ fontSize: '24px', fontWeight: '500', marginBottom: '4px' }}>
        {primaryText}
      </div>
      
      {/* Secondary Subtitle (Small/Gray) */}
      <div style={{ fontSize: '18px', color: '#ccc' }}>
        {secondaryText}
      </div>
    </div>
  );
};

export default SubtitleOverlay;