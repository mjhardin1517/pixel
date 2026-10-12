using Canvas.Core;

namespace Canvas.Tests;

public class CanvasStateTests
{
    private static PixelOp Op(int x, int y, uint color, long counter, string client) =>
        new(x, y, color, new Stamp(counter, client));

    [Fact]
    public void Higher_stamp_wins_regardless_of_order()
    {
        var older = Op(0, 0, 0xFF0000, 1, "a");
        var newer = Op(0, 0, 0x00FF00, 2, "b");

        var first = new CanvasState();
        first.Apply(older);
        first.Apply(newer);

        var second = new CanvasState();
        second.Apply(newer);
        second.Apply(older);

        Assert.Equal(newer, first.Pixels.Single());
        Assert.Equal(newer, second.Pixels.Single());
    }

    [Fact]
    public void Equal_counters_are_broken_by_client_id()
    {
        var fromA = Op(0, 0, 0xFF0000, 5, "a");
        var fromB = Op(0, 0, 0x00FF00, 5, "b");

        var state = new CanvasState();
        state.Apply(fromB);
        state.Apply(fromA);

        Assert.Equal(fromB, state.Pixels.Single());
    }

    [Fact]
    public void Applying_the_same_op_twice_is_a_no_op()
    {
        var op = Op(3, 4, 0x0000FF, 1, "a");
        var state = new CanvasState();

        Assert.True(state.Apply(op));
        Assert.False(state.Apply(op));
    }

    [Fact]
    public void Any_order_of_the_same_ops_converges()
    {
        var random = new Random(42);
        var ops = Enumerable.Range(0, 200)
            .Select(i => Op(random.Next(4), random.Next(4), (uint)random.Next(), random.Next(20), $"c{random.Next(3)}"))
            .ToList();

        var first = new CanvasState();
        foreach (var op in ops) first.Apply(op);

        var second = new CanvasState();
        foreach (var op in ops.OrderBy(_ => random.Next())) second.Apply(op);

        Assert.Equal(
            first.Pixels.OrderBy(p => (p.X, p.Y)),
            second.Pixels.OrderBy(p => (p.X, p.Y)));
    }
}