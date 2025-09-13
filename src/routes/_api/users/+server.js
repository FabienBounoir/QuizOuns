import { connection } from "$lib/server/db.server";
import { userService } from "$lib/server/services/user.service";
import { error, json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async () => {
	await connection;
	const users = await userService.getAll();

	return json(users);
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request, cookies }) => {
	const { username, password } = await request.json();

	const existingUser = await userService.getByUsername(username);

	if (existingUser) {
		throw error(400, "Username already taken");
	}

	const user = await userService.create(username, password);

	const jwt = await userService.login(username, password);

	cookies.set('sessionId', jwt, {
		path: '/',
		httpOnly: true,
		secure: false,
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 7
	});

	return json({ success: true, user });
};
