import '@testing-library/jest-dom'

import { expect, test } from 'vitest';

import { QueryClient } from '@tanstack/react-query';
import { UserComponent } from '@/routes/users';
import { renderWithProviders } from './setup';
import { screen } from '@testing-library/react';
import { userMockResponse } from './mocks';
import { usersQueryOptions } from '@/utils/users';

const pathPattern = '/users'





test('it shows the user name', async () => {
    const queryClient = new QueryClient()

    queryClient.setQueryData(usersQueryOptions({
        currentPage: 1,
        pageSize: 4,
    }).queryKey, userMockResponse)

    // Render
    const { renderResult } = await renderWithProviders(UserComponent, {
        pathPattern,
        // initialEntry,
        queryClient,
    })


    // Assert that the user name is displayed
    expect(screen.getByText("Users")).toBeInTheDocument()
    expect(renderResult).toBeTruthy();
    expect(renderResult).toBeDefined();
    //assert that pagination is displayed
    expect(await renderResult.findByText("Previous")).toBeInTheDocument();
    expect(await renderResult.findByText("Next")).toBeInTheDocument();
    const userRow = await renderResult.findByText(userMockResponse.data[0].name);
    expect(userRow).toBeInTheDocument();
})
