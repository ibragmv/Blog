'use client';

import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GameState {
  isPlaying: boolean;
  gameOver: boolean;
  score: number;
  highScore: number;
}

// Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const INITIAL_SPEED = 6;
const MAX_SPEED = 13;
const SPEED_INCREMENT = 0.001;
const OBSTACLE_SPAWN_RATE = 100; // Base frames

// Sprite definitions (x, y, w, h) from the sprite sheet
const SPRITES = {
  DINO_STAND: { x: 1678, y: 2, w: 88, h: 94 },
  DINO_RUN_1: { x: 1854, y: 2, w: 88, h: 94 },
  DINO_RUN_2: { x: 1942, y: 2, w: 88, h: 94 },
  DINO_JUMP: { x: 1678, y: 2, w: 88, h: 94 }, // Using stand for jump usually
  DINO_CRASH: { x: 2030, y: 2, w: 88, h: 94 },
  CACTUS_SMALL: [
    { x: 446, y: 2, w: 34, h: 70 },
    { x: 480, y: 2, w: 68, h: 70 }, // Double
    { x: 548, y: 2, w: 102, h: 70 }, // Triple
  ],
  CACTUS_LARGE: [
    { x: 652, y: 2, w: 50, h: 100 },
    { x: 702, y: 2, w: 100, h: 100 }, // Double
    { x: 802, y: 2, w: 150, h: 100 }, // Triple (approx)
  ],
  GROUND: { x: 2, y: 104, w: 2400, h: 24 },
  CLOUD: { x: 166, y: 2, w: 92, h: 27 },
};

// Use a reliable CDN for the sprite sheet
const SPRITE_SHEET_URL =
  'https://raw.githubusercontent.com/chromium/chromium/main/components/neterror/resources/images/default_200_percent/offline/200-offline-sprite.png';

export function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    gameOver: false,
    score: 0,
    highScore: 0,
  });

  // Assets
  const spriteSheetRef = useRef<HTMLImageElement | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Game State Refs
  const dinoRef = useRef({ x: 50, y: 0, w: 44, h: 47, dy: 0, grounded: false, frame: 0 });
  const obstaclesRef = useRef<
    { x: number; y: number; w: number; h: number; type: 'small' | 'large'; spriteIndex: number }[]
  >([]);
  const cloudsRef = useRef<{ x: number; y: number }[]>([]);
  const groundRef = useRef({ x: 0 });

  const speedRef = useRef(INITIAL_SPEED);
  const frameRef = useRef(0);
  const scoreRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  const isPlayingRef = useRef(false);
  const isGameOverRef = useRef(false);

  // Load Assets
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = SPRITE_SHEET_URL;
    img.onload = () => {
      spriteSheetRef.current = img;
      setAssetsLoaded(true);
    };

    const storedHighScore = localStorage.getItem('dino-high-score');
    if (storedHighScore) {
      setGameState((prev) => ({ ...prev, highScore: parseInt(storedHighScore, 10) }));
    }
  }, []);

  const drawGame = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, spriteSheet: HTMLImageElement) => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const groundY = canvas.height - 30;

      // Draw Clouds
      cloudsRef.current.forEach((cloud) => {
        ctx.drawImage(
          spriteSheet,
          SPRITES.CLOUD.x,
          SPRITES.CLOUD.y,
          SPRITES.CLOUD.w,
          SPRITES.CLOUD.h,
          cloud.x,
          cloud.y,
          SPRITES.CLOUD.w / 2,
          SPRITES.CLOUD.h / 2
        );
      });

      // Draw Ground (Infinite Scroll)
      const groundX = groundRef.current.x % (SPRITES.GROUND.w / 2);
      ctx.drawImage(
        spriteSheet,
        SPRITES.GROUND.x,
        SPRITES.GROUND.y,
        SPRITES.GROUND.w,
        SPRITES.GROUND.h,
        -groundX,
        groundY,
        SPRITES.GROUND.w / 2,
        SPRITES.GROUND.h / 2
      );
      ctx.drawImage(
        spriteSheet,
        SPRITES.GROUND.x,
        SPRITES.GROUND.y,
        SPRITES.GROUND.w,
        SPRITES.GROUND.h,
        -groundX + SPRITES.GROUND.w / 2,
        groundY,
        SPRITES.GROUND.w / 2,
        SPRITES.GROUND.h / 2
      );

      // Draw Obstacles
      obstaclesRef.current.forEach((obs) => {
        const spriteDef =
          obs.type === 'small'
            ? SPRITES.CACTUS_SMALL[obs.spriteIndex]
            : SPRITES.CACTUS_LARGE[obs.spriteIndex];

        ctx.drawImage(
          spriteSheet,
          spriteDef.x,
          spriteDef.y,
          spriteDef.w,
          spriteDef.h,
          obs.x,
          obs.y,
          obs.w,
          obs.h
        );
      });

      // Draw Dino
      const dino = dinoRef.current;
      let sprite = SPRITES.DINO_STAND;

      if (isGameOverRef.current) {
        sprite = SPRITES.DINO_CRASH;
      } else if (dino.grounded) {
        // Run animation (switch every 10 frames)
        sprite =
          Math.floor(frameRef.current / 5) % 2 === 0 ? SPRITES.DINO_RUN_1 : SPRITES.DINO_RUN_2;
      } else {
        sprite = SPRITES.DINO_JUMP;
      }

      ctx.drawImage(
        spriteSheet,
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h,
        dino.x,
        dino.y,
        dino.w,
        dino.h
      );
    },
    []
  );

  const handleGameOver = useCallback(() => {
    if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);

    isPlayingRef.current = false;
    isGameOverRef.current = true;

    // Draw crash state immediately
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && spriteSheetRef.current) {
      // Force one last draw to show crashed dino
      drawGame(ctx, canvas, spriteSheetRef.current);
    }

    setGameState((prev) => {
      const newHighScore = Math.max(prev.score, prev.highScore);
      localStorage.setItem('dino-high-score', newHighScore.toString());
      return {
        ...prev,
        isPlaying: false,
        gameOver: true,
        highScore: newHighScore,
      };
    });
  }, [drawGame]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spriteSheetRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update State
    if (isPlayingRef.current) {
      frameRef.current++;
      speedRef.current = Math.min(speedRef.current + SPEED_INCREMENT, MAX_SPEED);
      scoreRef.current += 0.1 * (speedRef.current / INITIAL_SPEED);

      // Update Ground
      groundRef.current.x += speedRef.current;

      // Update Clouds
      if (frameRef.current % 300 === 0 && Math.random() > 0.5) {
        cloudsRef.current.push({
          x: canvas.width,
          y: Math.random() * (canvas.height / 2),
        });
      }
      cloudsRef.current.forEach((c) => {
        c.x -= speedRef.current * 0.2;
      });
      cloudsRef.current = cloudsRef.current.filter((c) => c.x > -100);

      // Update Dino
      const dino = dinoRef.current;
      dino.dy += GRAVITY;
      dino.y += dino.dy;

      const groundY = canvas.height - 30;
      if (dino.y + dino.h > groundY + 10) {
        // +10 for visual overlap
        dino.y = groundY - dino.h + 10;
        dino.dy = 0;
        dino.grounded = true;
      }

      // Spawn Obstacles
      if (
        frameRef.current % Math.floor(OBSTACLE_SPAWN_RATE / (speedRef.current / INITIAL_SPEED)) ===
        0
      ) {
        if (Math.random() > 0.3) {
          // Chance to spawn
          const type = Math.random() > 0.6 ? 'large' : 'small';
          const spriteList = type === 'small' ? SPRITES.CACTUS_SMALL : SPRITES.CACTUS_LARGE;
          const spriteIndex = Math.floor(Math.random() * spriteList.length);
          const sprite = spriteList[spriteIndex];

          obstaclesRef.current.push({
            x: canvas.width,
            y: groundY - sprite.h / 2 + 15, // Adjust for ground visual
            w: sprite.w / 2,
            h: sprite.h / 2,
            type,
            spriteIndex,
          });
        }
      }

      // Update Obstacles
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.x -= speedRef.current;

        if (obs.x + obs.w < 0) {
          obstaclesRef.current.splice(i, 1);
        }

        // Collision (Simple AABB with padding)
        const padding = 10;
        if (
          dino.x + padding < obs.x + obs.w - padding &&
          dino.x + dino.w - padding > obs.x + padding &&
          dino.y + padding < obs.y + obs.h - padding &&
          dino.y + dino.h - padding > obs.y + padding
        ) {
          handleGameOver();
          return;
        }
      }

      // Update Score UI
      if (Math.floor(scoreRef.current) % 10 === 0) {
        setGameState((prev) => ({ ...prev, score: Math.floor(scoreRef.current) }));
      }
    }

    drawGame(ctx, canvas, spriteSheetRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [handleGameOver, drawGame]);

  const startGame = useCallback(() => {
    if (!assetsLoaded) return;

    isPlayingRef.current = true;
    isGameOverRef.current = false;
    speedRef.current = INITIAL_SPEED;
    scoreRef.current = 0;
    frameRef.current = 0;

    setGameState((prev) => ({ ...prev, isPlaying: true, gameOver: false, score: 0 }));

    const canvas = canvasRef.current;
    const startY = canvas ? canvas.height - 30 - 47 + 10 : 150;

    dinoRef.current = { x: 50, y: startY, w: 44, h: 47, dy: 0, grounded: false, frame: 0 };
    obstaclesRef.current = [];
    cloudsRef.current = [];
    groundRef.current = { x: 0 };

    if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    gameLoop();
  }, [assetsLoaded, gameLoop]);

  const jump = useCallback(() => {
    if (dinoRef.current.grounded) {
      dinoRef.current.dy = JUMP_FORCE;
      dinoRef.current.grounded = false;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!isPlayingRef.current && !isGameOverRef.current) {
          startGame();
        } else if (isGameOverRef.current) {
          startGame();
        } else {
          jump();
        }
      }
    },
    [startGame, jump]
  );

  const handleTouch = (_e: React.TouchEvent | React.MouseEvent) => {
    if (!isPlayingRef.current && !isGameOverRef.current) {
      startGame();
    } else if (isGameOverRef.current) {
      startGame();
    } else {
      jump();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = Math.min(parent.clientWidth, 600);
        canvas.height = 150;
      }
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="relative w-full max-w-[600px] border-b border-zinc-200 dark:border-zinc-800 overflow-hidden bg-transparent">
        {!assetsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs">
            Loading assets...
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="block w-full h-[150px] touch-none cursor-pointer"
          onClick={handleTouch}
          style={{ imageRendering: 'pixelated' }}
        />

        {/* UI Overlay */}
        <div className="absolute top-2 right-2 flex gap-4 font-mono text-xs text-zinc-600 dark:text-zinc-400 font-bold">
          <span>HI {gameState.highScore.toString().padStart(5, '0')}</span>
          <span>{Math.floor(gameState.score).toString().padStart(5, '0')}</span>
        </div>

        {!gameState.isPlaying && !gameState.gameOver && assetsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-zinc-500 dark:text-zinc-400 mb-2 font-mono text-xs">
                Press Space to Start
              </p>
            </div>
          </div>
        )}

        {gameState.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white/80 dark:bg-black/80 p-4 rounded backdrop-blur-sm">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">GAME OVER</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="mt-2 flex items-center gap-2 px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded text-xs font-bold hover:opacity-90 transition-opacity mx-auto"
              >
                <RotateCcw size={12} />
                RESTART
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
