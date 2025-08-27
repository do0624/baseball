import React from 'react';

export const PitchGauge = ({ value }) => (
  <div style={{ marginBottom: 10 }}>
    <div>투구 게이지</div>
    <div style={{ width: '100%', height: 20, background:'#eee', borderRadius: 10 }}>
      <div style={{ width:`${value}%`, height:'100%', background:'red', borderRadius:10 }}></div>
    </div>
  </div>
);

export const SwingGauge = ({ value }) => (
  <div style={{ marginBottom: 10 }}>
    <div>타격 게이지</div>
    <div style={{ width: '100%', height: 20, background:'#eee', borderRadius: 10 }}>
      <div style={{ width:`${value}%`, height:'100%', background:'#1E90FF', borderRadius:10 }}></div>
    </div>
  </div>
);
