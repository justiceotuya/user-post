import { act, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PostCard from '@/components/post-card'
import { TestableRouterUI } from './testRouter'

describe('Post Card', () => {
    it('renders Post Card', async () => {

        const rendered = await act(
            () => render(<TestableRouterUI><PostCard title="Item Label" body="Item Body" handleDeletePost={() => { }} created_at='' id='1' /></TestableRouterUI>),
        )
        expect(rendered).toBeTruthy();
        expect(rendered).toBeDefined();

        expect(await rendered.findByText('Item Label')).toBeInTheDocument();
        expect(await rendered.findByText('Item Body')).toBeInTheDocument();
    })
})
