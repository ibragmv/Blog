'use client';

export default function GlobalError() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-4xl font-display font-semibold">Application error</h1>
          <p className="text-zinc-400">The app hit an unrecoverable error during rendering.</p>
        </div>
      </body>
    </html>
  );
}
