import { userService } from "$lib/server/services/user.service";
import { error, json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ cookies }) => {
	const jwt = cookies.get('sessionId') || null;
	const user = await userService.getFromJWT(jwt);

	return json(user);
};
