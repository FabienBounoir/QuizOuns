<script>
	import { user } from '$lib/stores/user';
	import { api } from '$lib/utils/api';
	import { snacks } from '$lib/stores/snacks';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let quizzes = [];
	let loading = true;

	onMount(async () => {
		try {
			const response = await api.get('/quiz');
			quizzes = response.quizzes || [];
		} catch (error) {
			console.error('Erreur lors du chargement des quiz:', error);
			snacks.error('Erreur lors du chargement des quiz');
		} finally {
			loading = false;
		}
	});

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function createNewQuiz() {
		goto('/new');
	}

	function shareQuiz(quizId) {
		const url = `${window.location.origin}/quiz/${quizId}`;
		navigator.clipboard
			.writeText(url)
			.then(() => {
				snacks.success('Lien copié dans le presse-papiers !');
			})
			.catch(() => {
				snacks.error('Erreur lors de la copie du lien');
			});
	}

	function editQuiz(quizId) {
		goto(`/edit/${quizId}`);
	}

	function viewStats(quizId) {
		goto(`/view/${quizId}`);
	}

	async function deleteQuiz(quizId, quizTitle) {
		const confirmed = confirm(
			`Êtes-vous sûr de vouloir supprimer le quiz "${quizTitle}" ? Cette action est irréversible et supprimera également toutes les participations associées.`
		);

		if (!confirmed) return;

		try {
			await api.delete(`/quiz/${quizId}`);
			quizzes = quizzes.filter((quiz) => quiz._id !== quizId);
			snacks.success('Quiz supprimé avec succès');
		} catch (error) {
			console.error('Erreur lors de la suppression du quiz:', error);
			snacks.error('Erreur lors de la suppression du quiz');
		}
	}
</script>

<div class="quiz-dashboard">
	<header>
		<div class="header-content">
			<div class="header-text">
				<h1>
					<span class="greeting">Bonjour</span>
					<span class="username">{$user.username}</span>
					<span class="wave">👋</span>
				</h1>
				<p class="subtitle">Gérez vos quiz et suivez leurs performances</p>
			</div>
			<div class="header-actions">
				<button onclick={createNewQuiz} class="create-btn">
					<i class="fa-solid fa-plus"></i>
					Créer un quiz
				</button>
			</div>
		</div>
	</header>

	{#if loading}
		<div class="loading">Chargement...</div>
	{:else if quizzes.length === 0}
		<div class="empty-state">
			<h2>Aucun quiz créé</h2>
			<p>Vous n'avez pas encore créé de quiz. Commencez dès maintenant !</p>
			<button onclick={createNewQuiz} class="create-btn"> Créer mon premier quiz </button>
		</div>
	{:else}
		<div class="quiz-grid">
			{#each quizzes as quiz}
				<div class="quiz-card">
					<div class="quiz-header">
						<h3>{quiz.title}</h3>
						<div class="header-actions">
							<span class="privacy-badge {quiz.isPrivate ? 'private' : 'public'}">
								{quiz.isPrivate ? '🔒 Privé' : '🌍 Public'}
							</span>
							<button
								class="delete-quiz-btn"
								onclick={() => deleteQuiz(quiz._id, quiz.title)}
								aria-label="Supprimer le quiz"
								title="Supprimer le quiz"
							>
								<i class="fa-solid fa-trash"></i>
							</button>
						</div>
					</div>
					{#if quiz.description}
						<p class="description">{quiz.description}</p>
					{/if}
					<div class="quiz-meta">
						<span class="question-count">
							{quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''}
						</span>
						<span class="created-date">
							Créé le {formatDate(quiz.createdAt)}
						</span>
					</div>
					<div class="quiz-actions">
						<button class="play-btn" onclick={() => goto(`/quiz/${quiz._id}`)}>Jouer</button>
						<button
							class="stats-btn"
							onclick={() => viewStats(quiz._id)}
							aria-label="Voir les statistiques"><i class="fa-solid fa-chart-line"></i></button
						>
						<button
							class="edit-btn"
							onclick={() => editQuiz(quiz._id)}
							aria-label="Modifier le quiz"><i class="fa-solid fa-pen"></i></button
						>
						<button
							class="share-btn"
							onclick={() => shareQuiz(quiz._id)}
							aria-label="Partager le quiz"
						>
							<i class="fa-solid fa-arrow-up-from-bracket"></i>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.quiz-dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	header {
		background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 2.5rem;
		border: 1px solid var(--primary-200);
		box-shadow: 0 4px 20px rgba(251, 146, 60, 0.1);

		.header-content {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 2rem;

			@media (max-width: 768px) {
				flex-direction: column;
				text-align: center;
				gap: 1.5rem;
			}
		}

		.header-text {
			flex: 1;

			h1 {
				margin: 0 0 0.5rem 0;
				font-size: 2.25rem;
				font-weight: 700;
				line-height: 1.2;

				@media (max-width: 768px) {
					font-size: 1.75rem;
				}

				.greeting {
					color: var(--primary-700);
					font-weight: 400;
				}

				.username {
					color: var(--primary-900);
					background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
					background-clip: text;
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
				}

				.wave {
					margin-left: 0.5rem;
					display: inline-block;
					animation: wave 2s ease-in-out infinite;
				}
			}

			.subtitle {
				color: var(--primary-600);
				font-size: 1.1rem;
				margin: 0;
				font-weight: 500;
			}
		}

		.header-actions {
			display: flex;
			align-items: center;
			gap: 1.5rem;

			@media (max-width: 768px) {
				flex-direction: column;
				width: 100%;
			}
		}

		.stats-summary {
			display: flex;
			gap: 1rem;

			@media (max-width: 768px) {
				justify-content: center;
			}

			.stat-item {
				background: white;
				padding: 1rem 1.25rem;
				border-radius: 12px;
				text-align: center;
				border: 1px solid var(--primary-200);
				box-shadow: 0 2px 8px rgba(251, 146, 60, 0.1);
				transition: all 0.2s ease;

				&:hover {
					transform: translateY(-2px);
					box-shadow: 0 4px 16px rgba(251, 146, 60, 0.15);
				}

				.stat-number {
					display: block;
					font-size: 1.5rem;
					font-weight: 700;
					color: var(--primary-700);
					line-height: 1;
				}

				.stat-label {
					display: block;
					font-size: 0.75rem;
					color: var(--primary-500);
					font-weight: 500;
					text-transform: uppercase;
					letter-spacing: 0.5px;
					margin-top: 0.25rem;
				}
			}
		}
	}

	.create-btn {
		background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
		color: white;
		border: none;
		padding: 0.875rem 1.5rem;
		border-radius: 12px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 16px rgba(251, 146, 60, 0.25);
		position: relative;
		overflow: hidden;

		@media (max-width: 768px) {
			width: 100%;
			justify-content: center;
			padding: 1rem 1.5rem;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
			transition: left 0.5s ease;
		}

		&:hover {
			background: linear-gradient(135deg, var(--primary-700), var(--primary-800));
			transform: translateY(-2px);
			box-shadow: 0 6px 24px rgba(251, 146, 60, 0.35);

			&::before {
				left: 100%;
			}
		}

		&:active {
			transform: translateY(0);
		}

		i {
			font-size: 0.875rem;
		}
	}

	.loading {
		text-align: center;
		padding: 40px;
		color: var(--primary-700);
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--primary-700);

		h2 {
			margin-bottom: 10px;
			color: var(--primary-900);
		}

		p {
			margin-bottom: 30px;
		}
	}

	.quiz-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}

	.quiz-card {
		background: var(--primary-50);
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid var(--primary-200);

		&:hover {
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
			background: var(--primary-100);
		}

		h3 {
			margin: 0 0 10px 0;
			color: var(--primary-900);
			font-size: 18px;
		}

		.quiz-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;

			h3 {
				margin: 0;
				flex: 1;
			}

			.header-actions {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.privacy-badge {
				font-size: 12px;
				padding: 4px 8px;
				border-radius: 12px;
				font-weight: 500;

				&.public {
					background: var(--primary-200);
					color: var(--primary-800);
				}

				&.private {
					background: var(--primary-300);
					color: var(--primary-900);
				}
			}

			.delete-quiz-btn {
				background: var(--primary-700);
				color: white;
				border: none;
				width: 32px;
				height: 32px;
				border-radius: 50%;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.2s ease;
				font-size: 12px;

				&:hover {
					background: var(--primary-800);
					transform: scale(1.1);
				}

				&:active {
					transform: scale(0.95);
				}
			}
		}

		.description {
			color: var(--primary-700);
			margin-bottom: 15px;
			line-height: 1.4;
		}

		.quiz-meta {
			display: flex;
			justify-content: space-between;
			margin-bottom: 15px;
			font-size: 14px;
			color: var(--primary-600);

			.question-count {
				font-weight: 500;
			}
		}

		.quiz-actions {
			display: flex;
			gap: 10px;

			button {
				padding: 8px 16px;
				border: none;
				border-radius: 4px;
				cursor: pointer;
				font-size: 14px;
			}

			.play-btn {
				background: var(--primary-600);
				color: white;
				flex: 1; /* Le bouton "Jouer" prend l'espace restant */

				&:hover {
					background: var(--primary-700);
				}
			}

			.edit-btn,
			.share-btn,
			.stats-btn {
				/* Boutons avec icônes : taille fixe, pas de flex */
				width: 40px;
				padding: 8px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.stats-btn {
				background: var(--primary-200);
				color: var(--primary-900);
				border: 1px solid var(--primary-400);

				&:hover {
					background: var(--primary-300);
				}
			}

			.edit-btn {
				background: var(--primary-100);
				color: var(--primary-800);
				border: 1px solid var(--primary-300);

				&:hover {
					background: var(--primary-200);
				}
			}

			.share-btn {
				background: var(--primary-500);
				color: white;

				&:hover {
					background: var(--primary-600);
				}
			}
		}
	}

	@keyframes wave {
		0%,
		100% {
			transform: rotate(0deg);
		}
		10%,
		30%,
		50%,
		70%,
		90% {
			transform: rotate(14deg);
		}
		20%,
		40%,
		60%,
		80% {
			transform: rotate(-8deg);
		}
	}
</style>
