import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'

import LoadingComponent from '@/components/loading-component'
import Pagination from '@/components/paginations'
import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { usersQueryOptions } from '@/utils/users'

const pageSize = 4
export const Route = createFileRoute('/users')({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(usersQueryOptions({
            currentPage: 1,
            pageSize
        }))
    },
    pendingComponent: () => <LoadingComponent title="Users" />,
    component: UserComponent,
    head: () => ({
        meta: [{ title: 'Users' }],
    }),
})

interface User {
    id: string
    name: string
    email: string
    address?: {
        street: string
        city: string
        state: string
        zipcode: string
    }
}

export function UserComponent() {
   const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);

    const usersQuery = useSuspenseQuery(usersQueryOptions({
        currentPage,
        pageSize
    }))
    const users = usersQuery.data?.data

    const formatAddress = (address?: User['address']) => {
        if (!address) return 'N/A'
        return `${address.street}, ${address.state}, ${address.city}, ${address.zipcode}`
    }

    const handleNavigateToUserPosts = (userId: string) => {
        router.navigate({ to: `/users/${userId}/posts` })
    }


    return (
        <main>
            <div className='max-w-[855px] mx-auto mt-10 lg:mt-32 px-4'>
                <h1 className="text-6xl font-medium text-gray-900 mb-6">Users</h1>


                <div className='rounded-xl bg-white  mt-4 border border-gray-200'>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="">
                                    <th className="text-left py-[26px] px-6 font-medium text-xs text-gray-600">Full Name</th>
                                    <th className="text-left py-[26px] px-6 font-medium text-xs text-gray-600">Email Address</th>
                                    <th className="text-left py-[26px] px-6 font-medium text-xs text-gray-600" style={{ width: '392px' }}>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (

                                    <tr
                                        key={user.id}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`View posts for ${user.name}`}
                                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer focus:outline-none focus:bg-gray-100"
                                        onClick={() => handleNavigateToUserPosts(user.id)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                              handleNavigateToUserPosts(user.id);
                                            }
                                        }}
                                    >

                                        <td className="py-[26px] px-6 font-medium text-sm text-gray-600">{user.name}</td>
                                        <td className="py-[26px] px-6 text-sm text-gray-600">{user.email}</td>
                                        <td
                                            className="py-[26px] px-6 text-sm text-gray-600 truncate max-w-[392px] w-[392px] whitespace-nowrap overflow-hidden text-ellipsis"
                                            title={formatAddress(user.addresses)}
                                        >
                                            {formatAddress(user.addresses)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='flex justify-end items-end mt-6'>

                    <Pagination
                        currentPage={currentPage}
                        totalCount={usersQuery.data?.pagination.totalCount || 0}
                        pageSize={4}
                        onPageChange={page => setCurrentPage(page)}
                    />
                </div>
            </div>
        </main>
    )
}
