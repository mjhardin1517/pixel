using Canvas.Api;
using Canvas.Core;

// This file looks a lot like an express server. ASP.NET Core is the framework here, and this is their minimal API. Nest-like
// controllers, the older API, can also be found in the wild.
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<CanvasStore>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Alright more new things going on here. The framework inspects the types and injects things following a set of rules.
// So it will try to match route and query params, services you've registered and the request body. No more digging it out
// of the request in a JS express server like a n00b. I suppose Nest.js does this too. Isn't nest just copying .NET? o.O
app.MapPost("canvases/{id}/ops", (string id, PixelOp[] ops, CanvasStore store) => store.Apply(id, ops));


app.MapGet("canvases/{id}", (string id, CanvasStore store) =>
{
    Console.WriteLine($"Snapshotting canvas {id}");
    return store.Snapshot(id);
});

app.Run();
