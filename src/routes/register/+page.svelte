<script>
	import { goto } from '$app/navigation';
	import { snacks } from '$lib/stores/snacks';
	import { user } from '$lib/stores/user';

	let username = '';
	let password = '';
	let passwordConfirm = '';

	let submitting = false;

	const register = async (e) => {
		e.preventDefault();
		submitting = true;

		if (password !== passwordConfirm) {
			snacks.error('Les mots de passe ne correspondent pas.');
			submitting = false;
			return;
		}

		try {
			await user.register(username, password);
			await user.login(username, password);
			await goto('/admin');
		} catch (error) {
			snacks.error(error.message);
		} finally {
			submitting = false;
		}
	};
</script>

<main>
	<h1>Hello, <br />Qui es tu ?<br />🔎</h1>
	<form onsubmit={register}>
		<input
			type="text"
			bind:value={username}
			autocomplete="username"
			placeholder="Nom d'utilisateur"
			disabled={submitting}
		/>
		<input
			type="password"
			bind:value={password}
			autocomplete="current-password"
			placeholder="Mot de passe"
			disabled={submitting}
		/>
		<input
			type="password-confirm"
			bind:value={passwordConfirm}
			autocomplete="confirm-password"
			placeholder="Mot de passe (confirmation)"
			disabled={submitting}
		/>
		<button type="submit" disabled={submitting}>S'inscrire</button>
		<span
			onclick={() => {
				goto('/login');
			}}>Déjà un compte ?</span
		>
	</form>
</main>

<style lang="scss">
	form {
		display: grid;
		gap: 0.5em;

		span {
			text-align: center;
			font-size: 0.8em;
			color: var(--primary-600);

			&:hover {
				cursor: pointer;
				text-decoration: underline;
			}
		}
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
	}

	h1 {
		font-weight: 900;
		font-size: 2em;
		padding-bottom: 1em;
		color: var(--primary-900);
	}
</style>
