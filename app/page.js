import { Show, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function Home() {
  const user = await currentUser()

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Clerk Authentication
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Next.js app with custom Google and GitHub OAuth authentication, built using JavaScript.
        </p>

        <Show when="signed-out">
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/sign-in"
              className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
            >
              Sign In with Google / GitHub
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              Create Account
            </Link>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-left space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">User Profile</h2>
              <UserButton />
            </div>
            {user && (
              <div className="text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
                <p>
                  <strong className="text-zinc-900 dark:text-zinc-100">Name:</strong>{' '}
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'N/A'}
                </p>
                <p>
                  <strong className="text-zinc-900 dark:text-zinc-100">Email:</strong>{' '}
                  {user.emailAddresses?.[0]?.emailAddress || 'N/A'}
                </p>
                <p>
                  <strong className="text-zinc-900 dark:text-zinc-100">User ID:</strong>{' '}
                  <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">
                    {user.id}
                  </code>
                </p>
              </div>
            )}
          </div>
        </Show>
      </div>
    </div>
  )
}
