import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DinoGame } from '@/components/dino-game';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 font-display">
          404
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-8">
          But while you&apos;re here, why not set a new high score from any device?
        </p>
      </div>

      <DinoGame />

      <div className="mt-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
