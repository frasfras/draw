import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import anime from 'animejs/lib/anime.es.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ImageToSpeedDrawing = () => {
  const [image, setImage] = useState(null);
  const [lines, setLines] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const stageRef = useRef(null);
  const timelineRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        processImage(img);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  const processImage = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const newLines = [];

    for (let y = 0; y < canvas.height; y += 5) {
      for (let x = 0; x < canvas.width; x += 5) {
        const index = (y * canvas.width + x) * 4;
        if (data[index + 3] > 128) { // Check alpha channel
          newLines.push({
            points: [x, y, x, y],
            opacity: 0,
          });
        }
      }
    }

    setLines(newLines);
  };

  const animateDrawing = () => {
    setIsAnimating(true);
    const timeline = anime.timeline({
      easing: 'easeInOutSine',
      complete: () => setIsAnimating(false),
    });

    lines.forEach((line, index) => {
      timeline.add({
        targets: line,
        opacity: 1,
        duration: 10,
      }, index * 10);
    });

    timelineRef.current = timeline;
  };

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Image to Speed Drawing Animation</h1>
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />
      {image && (
        <div className="mb-4">
          <Button onClick={animateDrawing} disabled={isAnimating}>
            {isAnimating ? 'Animating...' : 'Start Animation'}
          </Button>
        </div>
      )}
      <Stage width={500} height={500} ref={stageRef}>
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="black"
              strokeWidth={1}
              opacity={line.opacity}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default ImageToSpeedDrawing;