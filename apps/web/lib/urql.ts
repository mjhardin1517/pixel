import {Client, fetchExchange, subscriptionExchange} from "urql";
import {createClient as createWSClient} from 'graphql-ws';

const url = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'localhost:4000/graphql'

export function makeClient() {
    const ws = typeof window !== 'undefined' ? createWSClient({url: `ws://${url}`}) : null;

    return new Client({
        url: `http://${url}`,
        // disabling gets for now as they are causing problems, in prod could be worth pursuing for HTTP caching
        preferGetMethod: false,
        exchanges: [
            fetchExchange,
            ...(ws ? [
                subscriptionExchange({
                    forwardSubscription(request) {
                        const input = {
                            ...request,
                            query: request.query || '',
                        }

                        return {
                            subscribe(sink) {
                                const unsubscribe = ws.subscribe(input, sink)
                                return {unsubscribe}
                            }
                        }
                    }
                })
            ] : [])
        ]
    })
}
