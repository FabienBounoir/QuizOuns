import { user } from "$lib/stores/user";
import { redirect } from "@sveltejs/kit";

export const prerender = true;
export const ssr = false;

/**
 * @type {import("./$types").LayoutLoad}
 */
export const load = async ({ url }) => {
	const $user = await user.refresh();

	console.log("Current URL:", url.pathname);

	if ($user.roles?.includes?.("anonymous") && (url.pathname !== "/login" && url.pathname !== "/register" && url.pathname !== "/public" && url.pathname !== "/" && !url.pathname.includes("/quiz/"))) {
		console.log("Redirecting anonymous user to /login");
		throw redirect(302, "/login");
	}
	else if (!$user.roles?.includes?.("anonymous") && (url.pathname === "/login" || url.pathname === "/register")) {
		console.log("Redirecting authenticated user to /admin");
		throw redirect(302, "/admin");
	}
};
