import type { TLSWebSocketServeOptions } from "bun";
import { Effect, pipe } from "effect";
import "reflect-metadata";

const CONTROLLER_METADATA_KEY = "hel:controller";
const ROUTE_METADATA_KEY = "hel:route";

interface Context {
	request: Request;
	params: Record<string, string>;
}
interface RouteDefinition {
	path: string;
	requestMethod: string;
	methodName: string;
}

type Handler = (ctx: Context) => Effect.Effect<Response, unknown, never>;

function addRoute(
	target: any,
	propertyKey: string | symbol,
	path: string,
	requestMethod: string,
): void {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	const routes: RouteDefinition[] =
		Reflect.getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];
	routes.push({
		path: normalizedPath,
		requestMethod,
		methodName: propertyKey as string,
	});
	Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
}

export const Decorators = {
	Controller: (prefix: string): ClassDecorator => {
		return (target) => {
			Reflect.defineMetadata(CONTROLLER_METADATA_KEY, { prefix }, target);
		};
	},
	Methods: {
		Get: (path: string): MethodDecorator => {
			return (target, propertyKey, descriptor): void => {
				addRoute(target, propertyKey, path, "GET");
			};
		},
		Post: (path: string): MethodDecorator => {
			return (target, propertyKey, descriptor): void => {
				addRoute(target, propertyKey, path, "POST");
			};
		},
		Patch: (path: string): MethodDecorator => {
			return (target, propertyKey, descriptor): void => {
				addRoute(target, propertyKey, path, "PATCH");
			};
		},
		Delete: (path: string): MethodDecorator => {
			return (target, propertyKey, descriptor): void => {
				addRoute(target, propertyKey, path, "DELETE");
			};
		},
	},
};

class HelApplication {
	private routes: Array<{ method: string; path: string; handler: Handler }> =
		[];
	private plugins: Array<(app: HelApplication) => void> = [];
	Route(method: string, path: string, handler: Handler): this {
		this.routes.push({ method, path, handler });
		return this;
	}
	Use(plugin: (app: HelApplication) => void): this {
		this.plugins.push(plugin);
		return this;
	}
	Controllers(controllers: any[]): this {
		for (const controller of controllers) {
			const controllerMeta = Reflect.getMetadata(
				CONTROLLER_METADATA_KEY,
				controller.constructor,
			);

			console.log(`[Hel] Found controller: [${controller.constructor.name}]`);

			if (!controllerMeta) {
				console.warn(
					`[Warning!] Controller ${controller.constructor.name} doesn't have prefix metadata`,
				);
			}
			const routes: RouteDefinition[] =
				Reflect.getMetadata(ROUTE_METADATA_KEY, controller.constructor) || [];

			for (const route of routes) {
				const fullPath = `${controllerMeta.prefix}${route.path}`;
				console.log(
					`[Hel] Route in [${controller.constructor.name}]: Endpoint: [${route.requestMethod}] [${route.path}] | [${route.methodName}]`,
				);
				this.Route(route.requestMethod, fullPath, (ctx) => {
					return (controller as any)[route.methodName](ctx.request);
				});
			}
		}
		return this;
	}
	Run(port: number, callback?: () => void): void {
		if (typeof Bun === "undefined") {
			throw new Error("Hel is designed to run on Bun only.");
		}
		for (const plugin of this.plugins) {
			plugin(this);
		}
		function normalize(path: string): string {
			if (path === "/") return path;
			return path.endsWith("/") ? path.slice(0, -1) : path;
		}

		const server = Bun.serve({
			port,
			fetch: async (req: Request) => {
				const urlToNormalize = new URL(req.url);
				const url = normalize(urlToNormalize.pathname);
				const route = this.routes.find(
					(r) => r.method === req.method && normalize(r.path) === url,
				);
				if (route) {
					const ctx: Context = { request: req, params: {} };
					return await pipe(route.handler(ctx), Effect.runPromise);
				}
				const error = { statusCode: 404, error: "Not Found" };
				return new Response(JSON.stringify(error), {
					status: 404,
					headers: { "Content-Type": "application/json" },
				});
			},
		} as unknown as TLSWebSocketServeOptions<unknown>);
		console.log("[Hel] Using version [0.0.1]");
		if (callback) {
			callback();
		} else {
			console.log(`[Hel] Server running on port: ${port}`);
		}
	}
}

export const Hel = new HelApplication();
