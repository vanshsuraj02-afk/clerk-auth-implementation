'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
    const { signIn, errors, fetchStatus } = useSignIn()
    const router = useRouter()

    const handleSocialSignIn = async (strategy) => {
        try {
            if (signIn?.sso) {
                const { error } = await signIn.sso({
                    strategy,
                    redirectUrl: '/sso-callback',
                    redirectCallbackUrl: '/sign-in',
                })
                if (error) {
                    console.error('SSO sign-in error:', error)
                }
            } else if (signIn?.authenticateWithRedirect) {
                await signIn.authenticateWithRedirect({
                    strategy,
                    redirectUrl: '/sso-callback',
                    redirectUrlComplete: '/',
                })
            }
        } catch (err) {
            console.error('Social sign-in error:', err)
        }
    }

    const handleSubmit = async (formData) => {
        const emailAddress = formData.get('email')
        const password = formData.get('password')

        const { error } = await signIn.password({
            emailAddress,
            password,
        })
        if (error) {
            console.error(JSON.stringify(error, null, 2))
            return
        }

        if (signIn.status === 'complete') {
            await signIn.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask)
                        return
                    }

                    const url = decorateUrl('/')
                    if (url.startsWith('http')) {
                        window.location.href = url
                    } else {
                        router.push(url)
                    }
                },
            })
        } else if (signIn.status === 'needs_second_factor') {
            // Multi-factor authentication
        } else if (signIn.status === 'needs_client_trust') {
            const emailCodeFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === 'email_code',
            )

            if (emailCodeFactor) {
                await signIn.mfa.sendEmailCode()
            }
        } else {
            console.error('Sign-in attempt not complete:', signIn)
        }
    }

    const handleVerify = async (formData) => {
        const code = formData.get('code')

        await signIn.mfa.verifyEmailCode({ code })

        if (signIn.status === 'complete') {
            await signIn.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask)
                        return
                    }

                    const url = decorateUrl('/')
                    if (url.startsWith('http')) {
                        window.location.href = url
                    } else {
                        router.push(url)
                    }
                },
            })
        } else {
            console.error('Sign-in attempt not complete:', signIn)
        }
    }

    if (signIn.status === 'needs_client_trust') {
        return (
            <div className="flex min-h-[80vh] items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Verify your account
                    </h1>
                    <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                        Enter the verification code sent to your email to continue.
                    </p>
                    <form action={handleVerify} className="space-y-4">
                        <div>
                            <label htmlFor="code" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Verification Code
                            </label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                required
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                            {errors.fields.code && (
                                <p className="mt-1 text-xs text-red-500">{errors.fields.code.message}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={fetchStatus === 'fetching'}
                            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify'}
                        </button>
                    </form>
                    <div className="mt-4 flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={() => signIn.mfa.sendEmailCode()}
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            Resend code
                        </button>
                        <button
                            type="button"
                            onClick={() => signIn.reset()}
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            Start over
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => handleSocialSignIn('oauth_google')}
                        disabled={fetchStatus === 'fetching'}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSocialSignIn('oauth_github')}
                        disabled={fetchStatus === 'fetching'}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
                    >
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        Continue with GitHub
                    </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                            Or continue with email
                        </span>
                    </div>
                </div>

                {/* Email / Password Form */}
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        {errors.fields.identifier && (
                            <p className="mt-1 text-xs text-red-500">{errors.fields.identifier.message}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        {errors.fields.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.fields.password.message}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={fetchStatus === 'fetching'}
                        className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        {fetchStatus === 'fetching' ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}