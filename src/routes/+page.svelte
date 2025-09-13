<script>
	import '../app.scss';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import Logo from '$lib/components/Logo.svelte';

	/** @type {{ _id: string; title: string; description?: string; questions: any[] }[]} */
	let publicQuizzes = $state([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await api.get('/public-quiz');
			publicQuizzes = [...response.quizzes.slice(0, 3)];
		} catch (error) {
			console.error('Error loading quizzes:', error);
		} finally {
			loading = false;
		}
	});
</script>

<main>
	<section class="hero">
		<div class="hero-bg" aria-hidden="true">
			{#each Array.from({ length: 28 }) as _, i}
				<span class="bang" style="--i:{i}">?</span>
			{/each}
		</div>
		<div class="hero-content">
			<h1>
				<span class="highlight">QuizOuns</span><br />
				Créez et partagez vos quiz<br />
				<span class="emoji"><Logo width={70} height={70} /></span>
			</h1>
			<p class="hero-description">
				Plateforme simple et intuitive pour créer des quiz interactifs, les partager avec vos amis
				ou tester vos connaissances sur des sujets variés.
			</p>
			<div class="hero-actions">
				<button class="cta-primary" onclick={() => goto('/public')}> Découvrir les quiz </button>
				<button class="cta-secondary" onclick={() => goto('/register')}> Créer un compte </button>
			</div>
		</div>
	</section>

	<section class="features">
		<div class="container">
			<h2>Pourquoi choisir QuizOuns ?</h2>
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🎯</div>
					<h3>Simple à utiliser</h3>
					<p>
						Interface intuitive pour créer des quiz en quelques clics, avec questions à choix unique
						ou multiple.
					</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">🔒</div>
					<h3>Public ou privé</h3>
					<p>
						Choisissez de rendre vos quiz publics pour tous ou privés pour un accès contrôlé par
						lien.
					</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">📊</div>
					<h3>Résultats instantanés</h3>
					<p>
						Obtenez votre score immédiatement après avoir terminé un quiz, avec un récapitulatif
						détaillé.
					</p>
				</div>
			</div>
		</div>
	</section>

	{#if !loading && publicQuizzes?.length > 0}
		<section class="recent-quizzes">
			<div class="container">
				<h2>Quiz populaires</h2>
				<div class="quiz-grid">
					{#each publicQuizzes as quiz}
						<div class="quiz-card" onclick={() => goto(`/quiz/${quiz._id}`)}>
							<h3>{quiz.title}</h3>
							{#if quiz.description}
								<p class="description">{quiz?.description}</p>
							{/if}
							<div class="quiz-meta">
								<span class="question-count">{quiz?.questionCount} questions</span>
								{#if quiz.createdAt}
									<span class="creation-date">
										Créé le {new Date(quiz.createdAt).toLocaleDateString('fr-FR')}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
				<div class="view-all">
					<button onclick={() => goto('/public')}>Voir tous les quiz</button>
				</div>
			</div>
		</section>
	{/if}

	<section class="cta-section">
		<div class="container">
			<h2>Prêt à commencer ?</h2>
			<p>Rejoignez notre communauté et créez votre premier quiz dès maintenant !</p>
			<button class="cta-large" onclick={() => goto('/register')}> Commencer gratuitement </button>
		</div>
	</section>
</main>

<style lang="scss">
	main {
		min-height: 100vh;
	}

	/* Hero Section */
	.hero {
		background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
		padding: 80px 20px;
		text-align: center;
		border-bottom: 2px solid var(--primary-200);
		height: 85vh;
		display: flex;
		align-items: center;
		position: relative;
		overflow: hidden;

		.hero-bg {
			position: absolute;
			inset: 0;
			pointer-events: none;
			opacity: 0.18;
			filter: blur(0.3px);
			z-index: 1;
		}

		.bang {
			position: absolute;
			font-weight: 800;
			font-family: system-ui, sans-serif;
			color: var(--primary-800);
			font-size: clamp(1.8rem, 4vw, 3.1rem);
			transform: translate(-50%, -50%) rotate(calc(var(--i) * 25deg));
			animation: bangSpin calc(12s + (var(--i) * 0.25s)) linear infinite;
			mix-blend-mode: multiply;
		}

		.bang:nth-child(1) {
			top: 15%;
			left: 20%;
		}
		.bang:nth-child(2) {
			top: 80%;
			left: 85%;
		}
		.bang:nth-child(3) {
			top: 25%;
			left: 75%;
		}
		.bang:nth-child(4) {
			top: 65%;
			left: 10%;
		}
		.bang:nth-child(5) {
			top: 40%;
			left: 90%;
		}
		.bang:nth-child(6) {
			top: 90%;
			left: 45%;
		}
		.bang:nth-child(7) {
			top: 10%;
			left: 60%;
		}
		.bang:nth-child(8) {
			top: 75%;
			left: 25%;
		}
		.bang:nth-child(9) {
			top: 35%;
			left: 5%;
		}
		.bang:nth-child(10) {
			top: 55%;
			left: 80%;
		}
		.bang:nth-child(11) {
			top: 20%;
			left: 40%;
		}
		.bang:nth-child(12) {
			top: 85%;
			left: 65%;
		}
		.bang:nth-child(13) {
			top: 45%;
			left: 15%;
		}
		.bang:nth-child(14) {
			top: 70%;
			left: 95%;
		}
		.bang:nth-child(15) {
			top: 30%;
			left: 50%;
		}
		.bang:nth-child(16) {
			top: 95%;
			left: 30%;
		}
		.bang:nth-child(17) {
			top: 5%;
			left: 85%;
		}
		.bang:nth-child(18) {
			top: 60%;
			left: 35%;
		}
		.bang:nth-child(19) {
			top: 50%;
			left: 85%;
		}
		.bang:nth-child(20) {
			top: 80%;
			left: 55%;
		}
		.bang:nth-child(21) {
			top: 25%;
			left: 95%;
		}
		.bang:nth-child(22) {
			top: 75%;
			left: 5%;
		}
		.bang:nth-child(23) {
			top: 15%;
			left: 45%;
		}
		.bang:nth-child(24) {
			top: 90%;
			left: 75%;
		}
		.bang:nth-child(25) {
			top: 40%;
			left: 25%;
		}
		.bang:nth-child(26) {
			top: 80%;
			left: 51%;
		}
		.bang:nth-child(27) {
			top: 35%;
			left: 85%;
		}
		.bang:nth-child(28) {
			top: 85%;
			left: 15%;
		}

		.bang:nth-child(3n) {
			color: var(--primary-200);
			animation-duration: 16s;
		}
		.bang:nth-child(4n) {
			color: var(--primary-400);
			animation-duration: 20s;
		}
		.bang:nth-child(5n) {
			color: var(--primary-500);
			opacity: 0.12;
		}

		.hero-content {
			max-width: 800px;
			margin: 0 auto;
			position: relative;
			z-index: 2;

			h1 {
				font-size: 3.5rem;
				font-weight: 900;
				margin-bottom: 20px;
				line-height: 1.2;
				color: var(--primary-900);

				.highlight {
					color: var(--primary-600);
					text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
				}

				.emoji {
					display: block;
					margin-top: 10px;
					animation: rocket 10s ease-in-out infinite;
					transform: translateY(20px) translateX(0px); /* Position de départ */
				}

				@keyframes rocket {
					10% {
						transform: translateY(20px) translateX(0px) rotate(0deg) scale(1);
					}

					/* montée verticale */
					20% {
						transform: translateY(-20px) translateX(0px) rotate(0deg) scale(1.05);
					}

					/* pivot à gauche avant de bouger */
					30% {
						transform: translateY(-10px) translateX(0px) rotate(-80deg) scale(1.05);
					}

					/* déplacement vers la gauche après rotation */
					40% {
						transform: translateY(-10px) translateX(-70px) rotate(-90deg) scale(1.05);
					}

					/* pivot à droite avant de bouger */
					60% {
						transform: translateY(-10px) translateX(0px) rotate(80deg) scale(1.05);
					}

					/* déplacement vers la droite après rotation */
					70% {
						transform: translateY(-10px) translateX(70px) rotate(90deg) scale(1.05);
					}

					80% {
						transform: translateY(-10px) translateX(70px) rotate(-90deg) scale(1.05);
					}

					/* retour vers le centre + redressement */
					90% {
						transform: translateY(-20px) translateX(0px) rotate(0deg) scale(1.05);
					}

					100% {
						transform: translateY(20px) translateX(0px) rotate(0deg) scale(1);
					}
				}

				@media (max-width: 768px) {
					font-size: 2.5rem;

					.emoji {
						font-size: 2rem;
					}
				}
			}

			.hero-description {
				font-size: 1.3rem;
				color: var(--primary-700);
				margin-bottom: 40px;
				line-height: 1.6;
				max-width: 600px;
				margin-left: auto;
				margin-right: auto;

				@media (max-width: 768px) {
					font-size: 1.1rem;
				}
			}

			.hero-actions {
				display: flex;
				gap: 20px;
				justify-content: center;
				flex-wrap: wrap;

				.cta-primary {
					background: var(--primary-600);
					color: white;
					padding: 15px 30px;
					font-size: 1.1rem;
					font-weight: 600;
					border-radius: 8px;
					border: none;
					cursor: pointer;
					width: auto !important;
					transition: all 0.3s ease;

					&:hover {
						background: var(--primary-700);
						transform: translateY(-2px);
						box-shadow: 0 4px 12px rgba(255, 121, 0, 0.3);
					}
				}

				.cta-secondary {
					background: transparent;
					color: var(--primary-600);
					padding: 15px 30px;
					font-size: 1.1rem;
					font-weight: 600;
					border-radius: 8px;
					border: 2px solid var(--primary-600);
					cursor: pointer;
					width: auto !important;
					transition: all 0.3s ease;

					&:hover {
						background: var(--primary-600);
						color: white;
						transform: translateY(-2px);
					}
				}
			}
		}
	}

	@keyframes bangSpin {
		0% {
			transform: translate(-50%, -50%) rotate(0deg) scale(1);
		}
		50% {
			transform: translate(-50%, -50%) rotate(180deg) scale(1.07);
		}
		100% {
			transform: translate(-50%, -50%) rotate(360deg) scale(1);
		}
	}

	@media (max-width: 768px) {
		.hero .bang {
			font-size: clamp(1.4rem, 6vw, 2.2rem);
			opacity: 0.15;
		}
	}

	/* Features Section */
	.features {
		padding: 80px 20px;
		background: white;

		.container {
			max-width: 1200px;
			margin: 0 auto;

			h2 {
				text-align: center;
				font-size: 2.5rem;
				font-weight: 800;
				color: var(--primary-900);
				margin-bottom: 50px;
			}

			.features-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
				gap: 40px;

				.feature-card {
					text-align: center;
					padding: 30px;
					border-radius: 12px;
					background: var(--primary-50);
					border: 1px solid var(--primary-200);
					transition: all 0.3s ease;

					&:hover {
						transform: translateY(-5px);
						box-shadow: 0 8px 24px var(--primary-200);
						background: var(--primary-100);
					}

					.feature-icon {
						font-size: 3rem;
						margin-bottom: 20px;
					}

					h3 {
						font-size: 1.4rem;
						font-weight: 700;
						color: var(--primary-800);
						margin-bottom: 15px;
					}

					p {
						color: var(--primary-700);
						line-height: 1.6;
						font-size: 1rem;
					}
				}
			}
		}
	}

	/* Recent Quizzes Section */
	.recent-quizzes {
		padding: 80px 20px;
		background: var(--primary-50);

		.container {
			max-width: 1200px;
			margin: 0 auto;

			h2 {
				text-align: center;
				font-size: 2.5rem;
				font-weight: 800;
				color: var(--primary-900);
				margin-bottom: 50px;
			}

			.quiz-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
				gap: 30px;
				margin-bottom: 40px;

				.quiz-card {
					background: white;
					border-radius: 12px;
					padding: 25px;
					border: 1px solid var(--primary-200);
					cursor: pointer;
					transition: all 0.3s ease;

					&:hover {
						transform: translateY(-3px);
						box-shadow: 0 8px 24px var(--primary-200);
						border-color: var(--primary-400);
					}

					h3 {
						font-size: 1.3rem;
						font-weight: 700;
						color: var(--primary-800);
						margin-bottom: 10px;
					}

					.description {
						color: var(--primary-600);
						font-size: 0.95rem;
						line-height: 1.5;
						margin-bottom: 15px;
					}

					.quiz-meta {
						display: flex;
						justify-content: space-between;
						align-items: center;
						flex-wrap: wrap;
						gap: 10px;

						.question-count {
							background: var(--primary-200);
							color: var(--primary-800);
							padding: 4px 12px;
							border-radius: 20px;
							font-size: 0.85rem;
							font-weight: 600;
						}

						.creation-date {
							color: var(--primary-500);
							font-size: 0.8rem;
							font-weight: 500;
							font-style: italic;
						}
					}
				}
			}

			.view-all {
				text-align: center;

				button {
					background: var(--primary-600);
					color: white;
					padding: 12px 24px;
					font-size: 1rem;
					font-weight: 600;
					border-radius: 8px;
					border: none;
					cursor: pointer;
					width: auto !important;
					transition: all 0.3s ease;

					&:hover {
						background: var(--primary-700);
					}
				}
			}
		}
	}

	/* CTA Section */
	.cta-section {
		padding: 80px 20px;
		background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
		text-align: center;
		color: white;

		.container {
			max-width: 800px;
			margin: 0 auto;
			justify-items: center;

			h2 {
				font-size: 2.5rem;
				font-weight: 800;
				margin-bottom: 20px;
			}

			p {
				font-size: 1.2rem;
				margin-bottom: 40px;
				opacity: 0.9;
				line-height: 1.6;
			}

			.cta-large {
				background: white;
				color: var(--primary-600);
				padding: 18px 40px;
				font-size: 1.2rem;
				font-weight: 700;
				border-radius: 10px;
				border: none;
				cursor: pointer;
				width: auto !important;
				transition: all 0.3s ease;

				&:hover {
					transform: translateY(-3px);
					box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
				}
			}
		}
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
	}
</style>
