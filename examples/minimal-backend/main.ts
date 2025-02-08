import { Hel } from "../../src";
import { PostController } from "./post/post.controller";
import { UserController } from "./user/user.controller";
import { UserService } from "./user/user.service";

const AppControllers = [
	new UserController(new UserService()),
	new PostController(),
];

Hel.Controllers(AppControllers).Run(3000);
