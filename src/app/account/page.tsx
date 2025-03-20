'use client'

import { SignedIn, SignedOut, SignInButton, UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { Particles } from "@/components/particles/particles";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-grow items-center justify-center p-4 relative">
      {/* Cyberpunk background */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-800 z-0'>
        {/* Grid overlay */}
        <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] cyberpunk-grid'></div>

        {/* Scanlines */}
        <div className='cyberpunk-scanline opacity-30 dark:opacity-100'></div>
        <div
          className='cyberpunk-scanline opacity-30 dark:opacity-100'
          style={{ top: '30%', animationDelay: '-2s' }}
        ></div>
        <div
          className='cyberpunk-scanline opacity-30 dark:opacity-100'
          style={{ top: '60%', animationDelay: '-5s' }}
        ></div>

        {/* Glowing orbs */}
        <div className='absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl cyberpunk-orb'></div>
        <div
          className='absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl cyberpunk-orb'
          style={{ animationDelay: '-2s' }}
        ></div>
        <div
          className='absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-pink-500/10 dark:bg-pink-500/20 blur-3xl cyberpunk-orb'
          style={{ animationDelay: '-4s' }}
        ></div>

        {/* Particle effect */}
        <Particles />
      </div>

      <SignedOut>
        <div className="max-w-md w-full bg-white/90 dark:bg-card/80 backdrop-blur-md text-card-foreground rounded-lg shadow-lg border border-purple-200 dark:border-white/10 p-8 z-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Account Login</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to access your account</p>
          </div>
          <div className="flex justify-center items-center">
            <SignInButton
              mode="modal"
              appearance={{
                baseTheme: theme === "dark" ? dark : undefined,
                elements: {
                  footerAction: { display: "none" },
                  socialButtonsRoot: { display: "none" },
                  dividerRow: { display: "none" },
                },
              }} >
              <Button
                type='button'
                className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105
                dark:text-white"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <UserProfile appearance={{
          baseTheme: theme === "dark" ? dark : undefined
        }} />
      </SignedIn>
    </div>
  )
}
