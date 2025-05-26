'use client';

import { useState, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs';

export default function UploadPage() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file || !userId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    setLoading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        router.push('/chat');
      } else {
        alert('Upload failed.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return <p className="text-white p-8">Please sign in to upload a file.</p>;
  }

  return (
    <>
      <header className="w-full px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">Chat with PDF</h1>
        <UserButton
          showName={true}
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonPopoverActionButtonText: 'text-white',
              userButtonPopoverFooter: 'text-white',
              userButtonPopoverCard: 'bg-zinc-900',
              userButtonBox: 'text-white',
              userButtonName: 'text-white',
            },
          }}
        />
      </header>

      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div
          className={`w-full max-w-2xl h-64 border-2 rounded-lg border-dashed p-10 flex items-center justify-center text-center transition-all ${
            dragActive ? 'border-blue-400 bg-blue-950' : 'border-white'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-lg">📄 Drag and drop your PDF here</p>
        </div>

        <p className="my-4 text-gray-400">— OR —</p>

        <div className="flex flex-col items-center space-y-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="upload-file"
          />
          <label
            htmlFor="upload-file"
            className="cursor-pointer px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-black transition"
          >
            Choose File
          </label>
          <p className="text-sm text-gray-400">
            {file ? file.name : 'No file selected'}
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-6 bg-white text-black px-6 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload and Continue'}
        </button>
      </main>
    </>
  );
}
