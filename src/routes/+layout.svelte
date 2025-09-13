<script>
	let { children } = $props();
	import Snacks from '$lib/components/Snacks.svelte';
	import myshades from '$lib/myshades/index.js';
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/user';
	import { page } from '$app/stores';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { goto } from '$app/navigation';
	import '../app.scss';
	import Logo from '$lib/components/Logo.svelte';

	let isLoggedIn = $state(false);
	let isPublicQuizPage = $state(false);
	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	onMount(async () => {
		if ($user && $user.color) {
			let primary = $user.color;

			if ($user.color.toLowerCase() == 'random') {
				primary = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

				if (primary.length < 7) {
					primary = primary.padEnd(7, '0');
				}
			}

			myshades({
				primary
			});
		}

		const handleClickOutside = (event) => {
			if (mobileMenuOpen && !event.target.closest('.main-nav')) {
				mobileMenuOpen = false;
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	$effect(() => {
		isLoggedIn = $user && !$user.roles?.includes('anonymous');
		isPublicQuizPage = $page.url.pathname.startsWith('/quiz/');
		changeColor($user?.color);
	});

	const changeColor = (primary) => {
		if ($user?.color?.toLowerCase?.() == 'random') {
			primary = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

			if (primary.length < 7) {
				primary = primary.padEnd(7, '0');
			}
		}

		myshades({
			primary
		});
	};
</script>

{#if !isPublicQuizPage}
	<nav class="main-nav">
		<div class="nav-content">
			<div class="nav-brand">
				<Logo width="32" height="32" />

				<a href="/" class="brand-link">QuizOuns</a>
			</div>

			<!-- Menu for mobile -->
			<button class="mobile-menu-btn" onclick={toggleMobileMenu} aria-label="Menu">
				<i class="fa-solid {mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}"></i>
			</button>

			<!-- Navigation desktop and mobile -->
			<div class="nav-links" class:mobile-open={mobileMenuOpen}>
				<a href="/public" class="nav-link" onclick={closeMobileMenu}>Quiz publics</a>

				{#if isLoggedIn}
					<a href="/admin" class="nav-link" onclick={closeMobileMenu}>Mes Quiz</a>
					<button
						onclick={() => {
							user.logout();
							goto('/');
							closeMobileMenu();
						}}
						class="logout-btn"
					>
						Déconnexion
					</button>
				{:else}
					<a href="/login" class="nav-link" onclick={closeMobileMenu}>Connexion</a>
				{/if}
			</div>
		</div>
	</nav>
{/if}

{@render children?.()}
<Snacks />

<style lang="scss">
	.main-nav {
		background: var(--primary-50);
		border-bottom: 1px solid var(--primary-200);
		padding: 0;
		position: sticky;
		top: 0;
		z-index: 1000;

		.nav-content {
			max-width: 1200px;
			margin: 0 auto;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 15px 20px;
			position: relative;

			@media (max-width: 768px) {
				padding: 10px 16px;
			}

			.nav-brand {
				display: flex;
				gap: 8px;

				.brand-link {
					font-size: 24px;
					font-weight: bold;
					color: var(--primary-600);
					text-decoration: none;

					&:hover {
						color: var(--primary-700);
					}
				}
			}

			.mobile-menu-btn {
				display: none;
				background: none;
				border: none;
				font-size: 1rem;
				color: var(--primary-600);
				cursor: pointer;
				padding: 2px 4px;
				border-radius: 2px;
				transition: all 0.2s ease;
				min-width: auto;
				line-height: 1;
				width: auto;

				&:hover {
					background: var(--primary-100);
					color: var(--primary-700);
				}

				@media (max-width: 768px) {
					display: block;
				}
			}

			.nav-links {
				display: flex;
				align-items: center;
				gap: 20px;
				flex-wrap: nowrap;

				@media (max-width: 768px) {
					position: absolute;
					top: 100%;
					left: 0;
					right: 0;
					background: var(--primary-50);
					border-top: 1px solid var(--primary-200);
					flex-direction: column;
					align-items: stretch;
					gap: 0;
					padding: 0.5rem 0;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
					transform: translateY(-100%);
					opacity: 0;
					visibility: hidden;
					transition: all 0.3s ease;

					&.mobile-open {
						transform: translateY(0);
						opacity: 1;
						visibility: visible;
					}
				}

				@media (max-width: 640px) and (min-width: 769px) {
					gap: 12px;
				}

				.nav-link {
					color: var(--primary-800);
					text-decoration: none;
					padding: 8px 12px;
					border-radius: 4px;
					transition: all 0.2s ease;
					white-space: nowrap;

					@media (max-width: 768px) {
						padding: 10px 20px;
						border-radius: 0;
						border-bottom: 1px solid var(--primary-100);
						font-size: 0.95rem;

						&:last-child {
							border-bottom: none;
						}
					}

					&:hover {
						background: var(--primary-100);
						color: var(--primary-600);
					}
				}

				.logout-btn {
					background: var(--primary-600);
					color: var(--primary-50);
					border: none;
					padding: 8px 16px;
					border-radius: 4px;
					cursor: pointer;
					transition: background 0.2s ease;
					white-space: nowrap;
					width: auto;

					@media (max-width: 768px) {
						margin: 4px 20px 8px 20px;
						padding: 10px 16px;
						border-radius: 6px;
						font-size: 0.9rem;
					}

					&:hover {
						background: var(--primary-700);
					}
				}
			}
		}
	}
</style>
