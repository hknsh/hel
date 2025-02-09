import { Decorators } from "../../../src";
import type { PostService } from "./post.service";

@Decorators.Controller("/posts")
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Decorators.Methods.Get("/")
	getPost(req: Request) {
		return this.postService.getPost();
	}

	@Decorators.Methods.Post("/")
	createPost(req: Request) {
		return this.postService.createPost();
	}

	@Decorators.Methods.Patch("/")
	updatePost(req: Request) {
		return this.postService.updatePost();
	}

	@Decorators.Methods.Delete("/")
	deletePost(req: Request) {
		return this.postService.deletePost();
	}
}
