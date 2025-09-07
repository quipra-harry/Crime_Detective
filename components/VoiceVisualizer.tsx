import React, { useRef, useEffect } from 'react';

interface VoiceVisualizerProps {
  audioStream: MediaStream;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioStream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      const { width, height } = canvas;
      canvasCtx.clearRect(0, 0, width, height);

      const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
      const baseRadius = 20;
      const maxRadiusMultiplier = 45;
      const radius = baseRadius + (average / 255) * maxRadiusMultiplier;
      
      // Outer, subtle pulsing ring
      canvasCtx.beginPath();
      canvasCtx.arc(width / 2, height / 2, radius + 15, 0, 2 * Math.PI);
      canvasCtx.fillStyle = `rgba(59, 130, 246, ${0.05 + (average / 255) * 0.15})`;
      canvasCtx.fill();

      // Middle, main ring
      canvasCtx.beginPath();
      canvasCtx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
      canvasCtx.fillStyle = `rgba(59, 130, 246, ${0.2 + (average / 255) * 0.4})`;
      canvasCtx.fill();

      // Inner, solid-ish circle
      canvasCtx.beginPath();
      canvasCtx.arc(width / 2, height / 2, baseRadius - 2, 0, 2 * Math.PI);
      canvasCtx.fillStyle = `rgba(59, 130, 246, ${0.8 + (average / 255) * 0.2})`;
      canvasCtx.fill();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      audioContext.close().catch(err => console.error('Error closing AudioContext:', err));
    };

  }, [audioStream]);

  return <canvas ref={canvasRef} width="80" height="80" />;
};

export default VoiceVisualizer;