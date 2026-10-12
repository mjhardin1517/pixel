namespace Canvas.Api;

// This will be important coming from Node vvv
using System.Collections.Concurrent;
using Canvas.Core;

public class CanvasStore
{
    // Turns out .NET runs requests in parallel unlike node
    private readonly ConcurrentDictionary<string, CanvasState> _canvases = new();

    public IReadOnlyList<PixelOp> Apply(string id, IEnumerable<PixelOp> ops)
    {
        // Does exactly what it sounds like, gets the current state or constructs a new one
        var state = _canvases.GetOrAdd(id, _ => new CanvasState());
        // Concurrent structures can all lock, it's unlocked when it leaves the lock scope
        lock (state)
        {
            // Although using where, apply is mutating the underlying data structure FYI
            return ops.Where(state.Apply).ToList();
        }
    }

    /// <summary>
    /// Get the pixel values for a given ID or nothing if there is no state yet
    /// </summary>
    public IReadOnlyList<PixelOp> Snapshot(string id)
    {
        var ok = _canvases.TryGetValue(id, out var state);
        if (!ok || state == null) return [];
        lock (state)
        {
            return state.Pixels.ToList();
        }
    }
}