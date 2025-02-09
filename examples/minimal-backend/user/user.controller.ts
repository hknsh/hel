import { Effect, pipe } from "effect";
import { Decorators } from "../../../src";
import type { UserService } from "./user.service";

@Decorators.Controller("/users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Decorators.Methods.Get("/")
	getUsers(req: Request): Effect.Effect<Response, unknown, never> {
		return pipe(
			Effect.succeed(this.userService.getAllUsers()),
			Effect.map(
				(users) =>
					new Response(JSON.stringify(users), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					}),
			),
		);
	}

	@Decorators.Methods.Post("/")
	createUser() {}

	@Decorators.Methods.Patch("/")
	updateUser() {}

	@Decorators.Methods.Delete("/")
	deleteUser() {}
}
