import DeleteButton from '@/assets/svg/delete-button.svg';

type Props = {
    title: string
    body: string
    created_at: string
    id: string
}

const PostCard = (props: Props) => {
    return (
        <div className='shadow-md rounded-lg p-6  bg-white hover:bg-gray-50 transition-colors duration-200 border border-gray-300
        w-full relative
        '>
            <button className='flex items-center justify-center w-6 h-6 absolute top-1 right-1 hover:opacity-80 transition-opacity duration-200 cursor-pointer'>
                <img
                    src={DeleteButton}
                    alt="Delete Post"
                    width={12}
                    height={12}
                />
            </button>
            <h2 className='font-medium text-lg mb-4 text-gray-600'>{props.title}</h2>
            <div className="overflow-hidden h-full relative">
                <p className="whitespace-normal break-words overflow-hidden text-ellipsis line-clamp-6">
                    {props.body}
                </p>
            </div>
        </div>
    )
}

export default PostCard
