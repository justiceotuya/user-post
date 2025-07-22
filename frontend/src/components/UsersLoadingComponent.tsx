
const UsersLoadingComponent = () => {
    return (
        <main>
            <div className='max-w-[855px] mx-auto mt-10 lg:mt-32 px-4'>
                <h1 className="text-6xl font-medium text-gray-900 mb-6">Users</h1>
                <div className='rounded-xl bg-white p-4 mt-4 border border-gray-200 h-[300px]'>
                    <div className="w-full flex flex-col items-center justify-center h-full">
                        <div>
                            <p className="text-gray-600">Loading users...</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default UsersLoadingComponent
