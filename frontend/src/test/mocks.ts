const userMock = [{ "id": "0242da41f40743feb0be0bbcf7f20e28", "name": "Mr. Derek Parisian", "username": "gMyxhsJ", "email": "UGglmoG@TeDAifj.net", "phone": "375-964-8121", "address": { "street": "3215 Madsen Street", "state": "CA", "city": "Hayward", "zipcode": "94541" } }, { "id": "04d878e89d3e4f0896096f3f9090b61f", "name": "Dr. Ezekiel Muller", "username": "aYySHTX", "email": "GTSYhvN@DItUwKQ.com", "phone": "416-389-1075", "address": { "street": "19 Heritage", "state": "CA", "city": "Oakland", "zipcode": "94605" } }]

const mockPosts = [
    { "id": "012b9fcbcd3542769581b6b70dfc407b", "title": "Eveniet et molestias odio ipsa nihil.", "body": "Dolorem est eos molestiae quam consequatur. Odit temporibus quae in voluptatem consequuntur. Fugiat ea temporibus possimus velit a.", "created_at": "2024-06-01T03:08:13+03:00", "user": "Prince Ethel DuBuque", "email": "VGVsSek@IMfCVEF.biz" }, { "id": "019e08f605a4456bbae03042ca7bdda8", "title": "Tenetur eum et veniam et voluptates.", "body": "Inventore rerum rem veniam quas aut. In nobis dignissimos suscipit ullam qui. Beatae nulla molestiae enim debitis numquam. Rerum velit est rem repellat aliquid.", "created_at": "2024-07-23T22:33:31+03:00", "user": "Prince Thad Klocko", "email": "vwpWWoj@KLQMRpV.org" }
]

const mockPagination = {
    currentPage: 1,
    totalPages: 83,
    totalCount: 830,
    limit: 10,
    offset: 0,
    hasNextPage: true,
    hasPreviousPage: false,
    nextPage: 2,
    previousPage: null,
    itemsOnCurrentPage: 10,
    startIndex: 1,
    endIndex: 10
}

const postsMockResponse = { "data": mockPosts, "pagination": mockPagination }
export const  userMockResponse = { "data": userMock, "pagination": mockPagination }
