import { Button, NonIdealState, Spinner } from '@blueprintjs/core'
import { ErrorBoundary } from '@sentry/react'

import { ComponentType, Suspense, useEffect, useRef } from 'react'
import { FCC } from 'types'

interface SuspensableProps {
  // deps that will cause the Suspense's error to reset
  retryDeps?: readonly any[]

  pendingTitle?: string

  fetcher?: () => void
}

export const Suspensable: FCC<SuspensableProps> = ({
  children,
  retryDeps = [],
  pendingTitle = '加载中',
  fetcher,
}) => {
  const resetError = useRef<() => void>()

  useEffect(() => {
    resetError.current?.()
    resetError.current = undefined
  }, retryDeps)

  return (
    <ErrorBoundary
      fallback={({ resetError: _resetError }) => {
        resetError.current = _resetError

        return (
          <NonIdealState
            icon="issue"
            title="加载失败"
            description={fetcher && '数据加载失败，请尝试重试'}
            action={
              fetcher && (
                <Button
                  intent="primary"
                  icon="refresh"
                  onClick={() => {
                    _resetError()
                    resetError.current = undefined
                    fetcher()
                  }}
                >
                  重试
                </Button>
              )
            }
          />
        )
      }}
    >
      <Suspense
        fallback={
          <NonIdealState
            icon={<Spinner />}
            title={pendingTitle}
            className="py-8"
          />
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export function withSuspensable<P extends {}>(
  Component: ComponentType<P>,
  {
    retryOnChange,
    ...suspensableProps
  }: Omit<SuspensableProps, 'retryDeps'> & {
    // keys of a subset of props that will be passed as `retryDeps` to Suspensable
    retryOnChange?: readonly (keyof P)[]
  } = {},
): ComponentType<P> {
  const Wrapped: ComponentType<P> = (props) => {
    return (
      <Suspensable
        {...suspensableProps}
        retryDeps={retryOnChange?.map((key) => props[key])}
      >
        <Component {...props} />
      </Suspensable>
    )
  }

  // Format for display in DevTools
  const name = Component.displayName || Component.name || 'Unknown'
  Wrapped.displayName = `withSuspensable(${name})`

  return Wrapped
}
