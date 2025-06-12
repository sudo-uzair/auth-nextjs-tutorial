//zod validations in the app 

import { z } from "zod";

export const schema = z.object({
  email: z.string().email("email must be valid"),
  password:z.string().min(8,"password must be of lenght 8")
});

export type schema = z.infer<typeof schema>;

