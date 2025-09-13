import { userService } from "$lib/server/services/user.service";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request, cookies }) => {
	const { username, password } = await request.json();
	const jwt = await userService.login(username, password);

	cookies.set('sessionId', jwt, {
		path: '/',
		httpOnly: true,
		secure: false,
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 7
	});

	return json({ success: true, jwt });
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const DELETE = async ({ cookies }) => {
	cookies.delete('sessionId', { path: '/' });

	return json({ success: true });
};
