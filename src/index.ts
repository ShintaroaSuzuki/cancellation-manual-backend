import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  CANCELLATION_MANUAL_IMAGES: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/images",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["PUT", "DELETE"],
    maxAge: 600,
    credentials: true,
  })
);

app.get("/", (c) => c.text("Hello Hono!"));

app.put("/images", async (c) => {
  const filepath = crypto.randomUUID();
  const { file }: { file: File } = await c.req.parseBody();
  if (file == null) return c.text("file is required", 400);
  if (file.type.startsWith("image/") === false)
    return c.text("file must be image", 400);
  await c.env.CANCELLATION_MANUAL_IMAGES.put(filepath, file);
  return c.json({ filepath }, 200);
});

app.delete("/images", async (c) => {
  const { filepath } = await c.req.json();
  if (filepath == null) return c.text("filepath is required", 400);
  await c.env.CANCELLATION_MANUAL_IMAGES.delete(filepath);
  return c.text("ok", 200);
});

export default app;
