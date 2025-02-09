import { Hel } from "../../src";
import { PostController } from "./post/post.controller";
import { PostService } from "./post/post.service";
import { UserController } from "./user/user.controller";
import { UserService } from "./user/user.service";

const AppControllers = [
	new UserController(new UserService()),
	new PostController(new PostService()),
];

Hel.Controllers(AppControllers).Run(3000);
