namespace Canvas.Core;

/// <summary>
/// A comparable counter for determining last edit from the client
/// </summary>
public readonly record struct Stamp(long Counter, string ClientId) : IComparable<Stamp>
{
    public int CompareTo(Stamp other)
    {
        // Order this stamp by the Counter first
        var byCounter = Counter.CompareTo(other.Counter);
        // Tie break with the ClientId
        return byCounter != 0 ? byCounter : string.CompareOrdinal(ClientId, other.ClientId);
    }
}

/// <summary>
/// An instruction to change the color of one pixel at specific coords
/// </summary>
public record PixelOp(int X, int Y, uint Color, Stamp Stamp);

public class CanvasState
{
    private readonly Dictionary<(int X, int Y), PixelOp> _pixels = new();

    public IReadOnlyCollection<PixelOp> Pixels => _pixels.Values;

    public bool Apply(PixelOp op)
    {
        // Our dictionary key is the xy tuple
        var key = (op.X, op.Y);

        // Get the stamp of the last pixel op we performed, if this incoming stamp has an earlier count than the one we
        // just grabbed (`current`), then we can ignore this pixel op
        if (_pixels.TryGetValue(key, out var current) && op.Stamp.CompareTo(current.Stamp) <= 0)
            return false;

        // Otherwise, we can apply this pixel op
        _pixels[key] = op;
        return true;
    }
}