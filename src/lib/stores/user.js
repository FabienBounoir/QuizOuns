import myshades from "$lib/myshades";
import { api } from "$lib/utils/api";
import { writable } from "svelte/store";

function init() {
	const { set, update, subscribe } = writable(
		/** @type {User} */({
			_id: "-1",
			profiles: ["anonymous"]
		})
	);

	async function refresh() {
		const user = await api.get("/sessions/me");
		set(user);

		return user;
	}

	/**
	 * @param {string} username
	 * @param {string} password
	 */
	async function login(username, password) {
		try {
			await api.post("/sessions", {
				username,
				password
			});

			await refresh();
		}
		catch (e) {
			throw e;
		}
	}

	function logout() {
		api.delete("/sessions").catch(() => { });

		set({
			_id: "-1",
			roles: ["anonymous"],
			color: "#8d71e1",
		});

		myshades({
			primary: "#8d71e1"
		});
	}

	/**
	 * @param {string} username
	 * @param {string} password
	 */
	async function register(username, password) {
		try {
			await api.post("/users", {
				username,
				password
			});

			await refresh();
		}
		catch (e) {
			throw e;
		}
	}

	function change(user) {
		set(user);
	}

	async function save(user) {
		return await api.put("/sessions/me", user);
	}

	return {
		subscribe,
		refresh,
		change,
		login,
		save,
		register,
		logout
	};
}

export const user = init();
