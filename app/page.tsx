import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';


export default async function HomePage() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen px-6 py-12 text-white bg-black">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-400">Chat with PDF</h1>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      {userId ? (
        <div className="mt-10">
          <p className="text-lg text-gray-200">Welcome! Ready to start chatting with a PDF?</p>
          <Link href="/upload">
            <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
              Upload a PDF
            </button>
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <p className="text-lg text-gray-300">
            Please{' '}
            <Link href="/sign-in" className="text-blue-400 underline hover:text-blue-500">
              sign in
            </Link>{' '}
            to get started.
          </p>
        </div>
      )}
    </main>
  );
}
