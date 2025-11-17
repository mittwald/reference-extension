import RemoteRoot from "@mittwald/flow-remote-react-components/RemoteRoot";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    createRootRouteWithContext,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";

interface RouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "mittwald Extension",
            },
        ],
    }),

    component: RootComponent,
});

function RootComponent() {
    const { queryClient } = Route.useRouteContext();

    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <QueryClientProvider client={queryClient}>
                    <RemoteRoot>
                        <Outlet />
                    </RemoteRoot>
                </QueryClientProvider>
                <Scripts />
            </body>
        </html>
    );
}
