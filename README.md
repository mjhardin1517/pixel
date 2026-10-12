# Pixel - multi-layered collaborative pixel art editor

Here we implement the well trodden "place" collaborative canvas as a learning project. The slight novelty
is the layers with which we are implementing it. It uses .NET for the backend, a Nest/GraphQL
gateway and a Next/React front end.

## Current features

## Future feature ideas

- Redis as message broker
- Persist data with postgres
- Users
- User owned canvases
- User invites other users to canvas
- Pixel art editing tools (paint, aseprite, etc...)

## Lessons learned

### Difficulties with Conflict-free Replicated Data Type

This problem is easier to solve with a canvas than with text. Each pixel is updated individually and
its location is known. The main problem was ensuring that the last edit truly won. That required a reliable
order of events to be established in our asynchronous distributed system. An appropriate solution seemed
to be a Lamport timestamp. Our stamp increases whenever an action is about to be performed, or whenever
a "remote" action has been observed. Ties were broken by sorting unique client IDs. The result is that
no matter when an instruction arrives at the server in time, the one with the larger counter will win.
Smaller counters are ignored.


