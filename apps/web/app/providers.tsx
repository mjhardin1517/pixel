'use client';

import { useState } from 'react';
import { Provider } from 'urql';
import { makeClient } from '@/lib/urql';

type Props = {
    children: React.ReactNode;
}

export function Providers({ children }: Props) {
    // Ensure there is only one per page as it is called on first render, a const would share one
    // due to SSR, and invoking the function in useState would create it every render
    const [client] = useState(makeClient)

    return <Provider value={client}>{children}</Provider>
}