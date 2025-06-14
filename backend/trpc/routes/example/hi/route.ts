import { publicProcedure } from "../../../create-context";

export default publicProcedure.query(() => {
  return "Hello from tRPC!";
});