// testRouter.tsx
import { Route, RouterProvider, createRootRoute, createRouter, createRouter as createTanstackRouter } from '@tanstack/react-router';

import { useMemo, type PropsWithChildren } from 'react';

/**
 * Test router provider for testing components that use the router.
 */
export function TestRouter(props: React.PropsWithChildren) {
    const router = useMemo(
        () =>
            createRouter({
                defaultComponent: () => props.children,
            }),
        [props.children],
    );
    return <RouterProvider router={router} />;
}


export const TestableRouterUI = (props: PropsWithChildren) => {
    const rootRoute = createRootRoute({
        component: () => props.children,
    })

    const router = useMemo(
        () => createTanstackRouter({
            routeTree: rootRoute.addChildren([
                new Route({
                    path: '*',
                    component: () => props.children,
                    getParentRoute: () => rootRoute,
                }),
            ]),
        }),
        [props.children, rootRoute],
    )

    return <RouterProvider router={router} />
}
