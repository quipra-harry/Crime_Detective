import React, { useRef, useEffect } from 'react';

// Configuration for the animation
const PARTICLE_COUNT = 400;
const PARTICLE_COLOR = '59, 130, 246'; // RGB for tailwind's blue-600
const CONNECTION_DISTANCE = 40;
const TARGET_SHAPE_SCALE = 0.35;

// Simple vector class for physics
class Vector {
  x: number;
  y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  add(v: Vector) {
    this.x += v.x;
    this.y += v.y;
  }
  limit(max: number) {
    const magSq = this.x * this.x + this.y * this.y;
    if (magSq > max * max) {
      const mag = Math.sqrt(magSq);
      this.x = (this.x / mag) * max;
      this.y = (this.y / mag) * max;
    }
  }
}

// Particle class
class Particle {
  pos: Vector;
  target: Vector;
  vel: Vector;
  acc: Vector;
  maxSpeed: number;
  maxForce: number;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    this.pos = new Vector(x, y);
    this.target = new Vector(targetX, targetY);
    this.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5);
    this.acc = new Vector();
    this.maxSpeed = Math.random() * 4 + 2;
    this.maxForce = Math.random() * 0.4 + 0.1;
  }

  applyForce(force: Vector) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc = new Vector(); // Reset acceleration
  }

  seek() {
    const desired = new Vector(this.target.x - this.pos.x, this.target.y - this.pos.y);
    desired.limit(this.maxSpeed);
    const steer = new Vector(desired.x - this.vel.x, desired.y - this.vel.y);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  flee(point: Vector) {
    const desired = new Vector(this.pos.x - point.x, this.pos.y - point.y);
    const d = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
    if (d < 50) {
        desired.limit(this.maxSpeed);
        const steer = new Vector(desired.x - this.vel.x, desired.y - this.vel.y);
        steer.limit(this.maxForce * 2); // Flee with more force
        this.applyForce(steer);
    }
  }
}

// Pre-defined points for a simple face outline
const faceShapePoints = [
    {x:0,y:-1.5},{x:0.1,y:-1.5},{x:0.2,y:-1.5},{x:0.3,y:-1.4},{x:0.4,y:-1.4},{x:0.5,y:-1.3},{x:0.6,y:-1.2},{x:0.7,y:-1.1},{x:0.8,y:-0.9},{x:0.9,y:-0.7},{x:1,y:-0.5},{x:1.1,y:-0.3},{x:1.1,y:-0.1},{x:1.1,y:0.1},{x:1.1,y:0.3},{x:1.1,y:0.5},{x:1,y:0.7},{x:0.9,y:0.9},{x:0.8,y:1.1},{x:0.7,y:1.2},{x:0.6,y:1.3},{x:0.5,y:1.4},{x:0.4,y:1.5},{x:0.3,y:1.55},{x:0.2,y:1.6},{x:0.1,y:1.6},{x:0,y:1.6},{x:-0.1,y:1.6},{x:-0.2,y:1.6},{x:-0.3,y:1.55},{x:-0.4,y:1.5},{x:-0.5,y:1.4},{x:-0.6,y:1.3},{x:-0.7,y:1.2},{x:-0.8,y:1.1},{x:-0.9,y:0.9},{x:-1,y:0.7},{x:-1.1,y:0.5},{x:-1.1,y:0.3},{x:-1.1,y:-0.1},{x:-1.1,y:-0.3},{x:-1,y:-0.5},{x:-0.9,y:-0.7},{x:-0.8,y:-0.9},{x:-0.7,y:-1.1},{x:-0.6,y:-1.2},{x:-0.5,y:-1.3},{x:-0.4,y:-1.4},{x:-0.3,y:-1.4},{x:-0.2,y:-1.5},{x:-0.1,y:-1.5},
    {x:-0.5,y:-0.3},{x:-0.4,y:-0.3},{x:-0.3,y:-0.3}, // Left eye
    {x:0.3,y:-0.3},{x:0.4,y:-0.3},{x:0.5,y:-0.3}, // Right eye
    {x:-0.2,y:0.8},{x:-0.1,y:0.9},{x:0,y:0.9},{x:0.1,y:0.9},{x:0.2,y:0.8}, // Mouth
];

const GenerativeAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePosRef = useRef<Vector | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const particles: Particle[] = [];

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mousePosRef.current = new Vector(e.clientX - rect.left, e.clientY - rect.top);
        };

        const onMouseOut = () => {
            mousePosRef.current = null;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseout', onMouseOut);


        // Initialize particles
        const { width, height } = canvas.getBoundingClientRect();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const pointIndex = i % faceShapePoints.length;
            const targetPoint = faceShapePoints[pointIndex];
            
            const targetX = (targetPoint.x * 100 * TARGET_SHAPE_SCALE) + width / 2;
            const targetY = (targetPoint.y * 100 * TARGET_SHAPE_SCALE) + height / 2;

            particles.push(
                new Particle(Math.random() * width, Math.random() * height, targetX, targetY)
            );
        }

        const animate = () => {
            const { width, height } = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                p1.seek();
                if (mousePosRef.current) {
                    p1.flee(mousePosRef.current);
                }
                p1.update();

                // Draw particle
                const alpha = Math.min(0.8, p1.vel.x * p1.vel.x + p1.vel.y * p1.vel.y);
                ctx.fillStyle = `rgba(${PARTICLE_COLOR}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(p1.pos.x, p1.pos.y, 2, 0, Math.PI * 2);
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.pos.x - p2.pos.x;
                    const dy = p1.pos.y - p2.pos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DISTANCE) {
                        ctx.strokeStyle = `rgba(${PARTICLE_COLOR}, ${1 - dist / CONNECTION_DISTANCE})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p1.pos.x, p1.pos.y);
                        ctx.lineTo(p2.pos.x, p2.pos.y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseout', onMouseOut);
        };
    }, []);

    return (
        <canvas ref={canvasRef} className="w-full h-full" />
    );
};

export default GenerativeAnimation;
