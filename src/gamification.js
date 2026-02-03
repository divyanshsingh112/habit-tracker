// src/gamification.js
import confetti from 'canvas-confetti';

export const XP_PER_TASK = 10;
export const COINS_PER_PERFECT_DAY = 5;

export const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4caf50', '#ff9800', '#2196f3']
  });
};

export const calculateLevelProgress = (currentXp, currentLevel) => {
  const xpNeeded = currentLevel * 100;
  return Math.min((currentXp / xpNeeded) * 100, 100);
};