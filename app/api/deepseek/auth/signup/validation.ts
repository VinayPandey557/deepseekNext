import zod from "zod";

 export const signUpSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
})