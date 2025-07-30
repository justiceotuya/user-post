import { NewPostModal } from '@/components/new-post-modal'
import { createFileRoute } from '@tanstack/react-router'

const pageSize = 4
export const Route = createFileRoute("/users_/$userId/posts/new")({
    // loader: async ({ context }) => {
    //     await context.queryClient.ensureQueryData(usersQueryOptions({
    //         currentPage: 1,
    //         pageSize
    //     }))
    // },
    // pendingComponent: () => <LoadingComponent title="Users" />,
    component: NewPostModal,
    head: () => ({
        meta: [{ title: 'Add New Post' }],
    }),
})
