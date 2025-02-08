import { Effect } from "effect";
import { Decorators } from "../../../src";

@Decorators.Controller("/posts")
export class PostController {
	@Decorators.Methods.Get("/")
	getPost(req: Request): Effect.Effect<Response, never, never> {
		return Effect.succeed(new Response("New post!"));
	}

	@Decorators.Methods.Post("/delete")
	deletePost(req: Request): Effect.Effect<Response, never, never> {
		return Effect.succeed(new Response("Delete post!"));
	}
}
