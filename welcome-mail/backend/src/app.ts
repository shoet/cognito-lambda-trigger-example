import { Hono } from "hono";
import { z } from "zod";
import * as Usecase from "./usecase";

export const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/signup", async (c) => {
  const requestBody = z.object({
    email: z.string().min(1),
    password: z.string().min(1),
  });

  const body = await c.req.json();
  const { success, data, error } = requestBody.safeParse(body);
  if (!success) {
    console.error("Invalid request body", error);
    return c.json({ message: "Invalid request body" }, 400);
  }

  await Usecase.signUp(data.email, data.password);

  return c.json(
    {
      message: "success",
    },
    200,
  );
});
