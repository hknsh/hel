import { Effect } from "effect";

export class PostService {
	getPost(): Effect.Effect<Response, unknown, never> {
		return Effect.succeed(new Response("Get"));
	}
	createPost(): Effect.Effect<Response, unknown, never> {
		return Effect.succeed(new Response("Create"));
	}
	updatePost(): Effect.Effect<Response, unknown, never> {
		return Effect.succeed(new Response("Update"));
	}
	deletePost(): Effect.Effect<Response, unknown, never> {
		return Effect.succeed(new Response("Delete"));
	}
}
