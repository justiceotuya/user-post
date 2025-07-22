import { useEffect, useState } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { usersQueryOptions } from '@/utils/users'

export const Route = createFileRoute('/users')({
    loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(usersQueryOptions())
  },
  component: UserComponent,
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

function UserComponent() {
    const usersQuery = useSuspenseQuery(usersQueryOptions())
    const users = usersQuery.data
//   const [users, setUsers] = useState<User[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     fetch('http://localhost:5003/users')
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Failed to fetch users')
//         }
//         return response.json()
//       })
//       .then(data => {
//         setUsers(data)
//         setLoading(false)
//       })
//       .catch(err => {
//         setError(err.message)
//         setLoading(false)
//       })
//   }, [])

  const formatAddress = (address?: User['address']) => {
    if (!address) return 'N/A'
    return `${address.street}, ${address.state}, ${address.city}, ${address.zipcode}`
  }

//   if (loading) {
//     return (
    //   <main>
    //     <div className='max-w-[855px] mx-auto  mt-32'>
    //       <h1 className="text-6xl font-medium text-gray-900 mb-6">Users</h1>
    //       <div className='rounded-xl bg-white p-4 mt-4 border border-gray-200'>
    //         <p className="text-gray-600">Loading users...</p>
    //       </div>
    //     </div>
    //   </main>
//     )
//   }

//   if (error) {
//     return (
//       <main>
//         <div className='max-w-[855px] mx-auto  mt-32'>
//           <h1 className="text-6xl font-medium text-gray-900 mb-6">Users</h1>
//           <div className='rounded-xl bg-white p-4 mt-4 border border-gray-200'>
//             <p className="text-red-600">Error: {error}</p>
//           </div>
//         </div>
//       </main>
//     )
//   }

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
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-[26px] px-6 font-medium text-sm text-gray-600">{user.name}</td>
                    <td className="py-[26px] px-6 text-sm text-gray-600">{user.email}</td>
                    <td
                      className="py-[26px] px-6 text-sm text-gray-600 truncate"
                      style={{
                        width: '392px',
                        maxWidth: '392px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={formatAddress(user.address)}
                    >
                      {formatAddress(user.address)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
