import React from 'react';

const SubtitleOverlay: React.FC = () => {
  return (
    <div style={{
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '24px',
      pointerEvents: 'none', // Allow clicks to pass through to the video
    }}>
      SubLingo: Active
    </div>
  );
};

export default SubtitleOverlay;