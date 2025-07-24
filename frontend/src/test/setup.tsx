import '@testing-library/jest-dom';

import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import React from 'react'

type RenderOptions = {
  pathPattern: string
  initialEntry?: string
  queryClient?: QueryClient
}

/**
 * Renders a component under:
 *  - a minimal TanStack Router instance (memory history),
 *  - optionally wrapped in a QueryClientProvider.
 *
 * If `initialEntry` is omitted, it defaults to `pathPattern`.
 *
 * @param Component  The React component to mount.
 * @param opts       Render options.
 * @returns { router, renderResult }
 */

export async function renderWithProviders(
  Component: React.ComponentType,
  { pathPattern, initialEntry = pathPattern, queryClient }: RenderOptions,
) {
  // Root route with minimal Outlet for rendering child routes
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <div data-testid="root-layout"></div>
        <Outlet />
      </>
    ),
  })

  // Index route so '/' always matches
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Index</div>,
  })

  // Test route mounting your Component at the dynamic path
  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: pathPattern,
    component: () => <Component />,
  })

  // Create the router instance with memory history
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, testRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    defaultPendingMinMs: 0,
  })

  // Build the render tree and add QueryClientProvider if provided
  let tree = <RouterProvider router={router} />
  if (queryClient) {
    tree = (
      <QueryClientProvider client={queryClient}>{tree}</QueryClientProvider>
    )
  }

  // Render and wait for the route to resolve and the component to mount
  const renderResult = render(tree)
  await screen.findByTestId('root-layout')

  return { router, renderResult }
}
