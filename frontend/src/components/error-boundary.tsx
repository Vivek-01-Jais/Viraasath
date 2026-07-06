"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import Link from "next/link"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="text-lg font-heading font-bold text-[#800020] dark:text-[#B8860B] mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#9C9C9C] mb-6 text-center max-w-md">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg bg-[#800020] text-white text-sm hover:bg-[#600018] transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border border-[#E5E0DB] dark:border-[#333] text-[#6B6B6B] dark:text-[#9C9C9C] text-sm hover:bg-[#F5F0EB] dark:hover:bg-[#242424] transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}