import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string }
}) {
  const session = await auth()

  // If already logged in, redirect to callback URL or home
  if (session) {
    redirect(searchParams.callbackUrl || "/")
  }

  const error = searchParams.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-2">Kempo</h1>
        <p className="text-gray-500 text-center text-sm mb-6">Private Access</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error === "AccessDenied" ? (
              <>
                <strong>Access Denied.</strong> Your email is not authorized to access this site.
              </>
            ) : (
              <>
                <strong>Error.</strong> There was a problem signing in. Please try again.
              </>
            )}
          </div>
        )}

        <p className="text-gray-600 text-center mb-6">
          Sign in with your Google account to access Kempo.
        </p>
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: searchParams.callbackUrl || "/" })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          This is a private project. Only authorized users can access.
        </p>
      </div>
    </div>
  )
}
