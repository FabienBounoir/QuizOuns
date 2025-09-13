export class API {
	#host;

	constructor(host) {
		this.#host = host;
	}

	/**
	 * Core HTTP request handler with error handling and cookie support
	 */
	async #request(endpoint, init = {}) {
		const url = `${this.#host}${endpoint}`;

		const response = await fetch(url, {
			method: init.method,
			headers: {
				"Content-Type": "application/json",
				...(init.headers || {})
			},
			credentials: 'include',
			body: init.body ? JSON.stringify(init.body) : undefined
		});

		const body = await response.json();

		if (response.status >= 400)
			throw {
				status: response.status,
				id: "unknown",
				...body
			};

		return body;
	}

	get(endpoint) {
		return this.#request(endpoint, { method: "GET" });
	}

	post(endpoint, body) {
		return this.#request(endpoint, { method: "POST", body });
	}

	patch(endpoint, body) {
		return this.#request(endpoint, { method: "PATCH", body });
	}

	put(endpoint, body) {
		return this.#request(endpoint, { method: "PUT", body });
	}

	delete(endpoint, body) {
		return this.#request(endpoint, { method: "DELETE", body });
	}
}

export const api = new API("/_api");
