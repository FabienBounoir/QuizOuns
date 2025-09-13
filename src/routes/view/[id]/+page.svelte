<script>
	import { page } from '$app/stores';
	import { api } from '$lib/utils/api';
	import { snacks } from '$lib/stores/snacks';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let stats = $state(null);
	let loading = $state(true);
	let error = $state(null);

	const quizId = $page.params.id;

	onMount(async () => {
		try {
			const response = await api.get(`/quiz/${quizId}/stats`);
			stats = response;
		} catch (err) {
			console.error('Erreur lors du chargement des statistiques:', err);
			error = err.message || 'Erreur lors du chargement des statistiques';
			if (err.message?.includes('Non autorisé')) {
				snacks.error("Vous n'êtes pas autorisé à voir ces statistiques");
				goto('/admin');
				return;
			}
			snacks.error('Erreur lors du chargement des statistiques');
		} finally {
			loading = false;
		}
	});

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getScoreClass(score) {
		if (score >= 80) return 'excellent';
		if (score >= 60) return 'good';
		if (score >= 40) return 'average';
		return 'poor';
	}

	function goBack() {
		goto('/admin');
	}
</script>

<div class="stats-container">
	{#if loading}
		<div class="loading">
			<p>Chargement des statistiques...</p>
		</div>
	{:else if error}
		<div class="error">
			<h2>Erreur</h2>
			<p>{error}</p>
			<button onclick={goBack} class="btn-secondary">Retour</button>
		</div>
	{:else if stats}
		<header class="stats-header">
			<button onclick={goBack} class="back-btn">
				<i class="fa-solid fa-arrow-left"></i> Retour
			</button>
			<div class="quiz-info">
				<h1>Statistiques : {stats.quiz.title}</h1>
				{#if stats.quiz.description}
					<p class="quiz-description">{stats.quiz.description}</p>
				{/if}
				<p class="quiz-meta">
					Créé le {formatDate(stats.quiz.createdAt)} • {stats.quiz.totalQuestions} question{stats
						.quiz.totalQuestions > 1
						? 's'
						: ''}
				</p>
			</div>
		</header>

		<!-- Statistiques globales -->
		<section class="global-stats">
			<h2>Vue d'ensemble</h2>
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-number">{stats.global.totalParticipations}</div>
					<div class="stat-label">
						Participation{stats.global.totalParticipations > 1 ? 's' : ''}
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-number {getScoreClass(stats.global.averageScore)}">
						{stats.global.averageScore}%
					</div>
					<div class="stat-label">Score moyen</div>
				</div>
				<div class="stat-card">
					<div class="stat-number excellent">{stats.global.bestScore}%</div>
					<div class="stat-label">Meilleur score</div>
				</div>
				<div class="stat-card">
					<div class="stat-number poor">{stats.global.worstScore}%</div>
					<div class="stat-label">Score le plus bas</div>
				</div>
			</div>
		</section>

		{#if stats.participations.length > 0}
			<!-- Liste des participations -->
			<section class="participations">
				<h2>Détail des participations</h2>
				<div class="participations-table">
					<div class="table-header">
						<div>Participant</div>
						<div>Score</div>
						<div>Bonnes réponses</div>
						<div>Date</div>
					</div>
					{#each stats.participations as participation}
						<div class="table-row">
							<div class="participant-name">{participation.username}</div>
							<div class="score {getScoreClass(participation.score)}">{participation.score}%</div>
							<div class="correct-answers">
								{participation.correctAnswers}/{participation.totalQuestions}
							</div>
							<div class="date">{formatDate(participation.submittedAt)}</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Statistiques par question -->
			<section class="question-stats">
				<h2>Analyse par question</h2>
				{#each stats.questionStats as questionStat, index}
					<div class="question-analysis">
						<div class="question-header">
							<h3>Question {index + 1}</h3>
							<div class="success-rate {getScoreClass(questionStat.successRate)}">
								{questionStat.successRate}% de réussite
							</div>
						</div>
						<p class="question-text">{questionStat.questionText}</p>

						<div class="question-details">
							<div class="correct-answers-info">
								<strong>Réponse(s) correcte(s) :</strong>
								<ul>
									{#each questionStat.correctOptions as option}
										<li>{option}</li>
									{/each}
								</ul>
							</div>

							<div class="answer-distribution">
								<h4>Distribution des réponses :</h4>
								{#each Object.entries(questionStat.answerDistribution) as [option, count]}
									<div class="distribution-item">
										<span class="option-text">{option}</span>
										<span class="count">{count} fois</span>
										<div class="progress-bar">
											<div
												class="progress-fill"
												style="width: {(count / questionStat.totalAttempts) * 100}%"
											></div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</section>
		{:else}
			<section class="no-data">
				<div class="empty-state">
					<i class="fa-solid fa-chart-line"></i>
					<h2>Aucune participation</h2>
					<p>Ce quiz n'a pas encore été complété par des participants.</p>
					<button onclick={() => goto(`/quiz/${quizId}`)} class="btn-primary">
						Tester le quiz
					</button>
				</div>
			</section>
		{/if}
	{/if}
</div>

<style lang="scss">
	.stats-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		min-height: 100vh;
	}

	.loading,
	.error {
		text-align: center;
		padding: 60px 20px;

		p {
			color: var(--primary-700);
			margin-bottom: 20px;
		}
	}

	.stats-header {
		margin-bottom: 40px;

		.back-btn {
			background: var(--primary-100);
			color: var(--primary-800);
			border: 1px solid var(--primary-300);
			padding: 8px 16px;
			border-radius: 6px;
			cursor: pointer;
			margin-bottom: 20px;
			display: inline-flex;
			align-items: center;
			gap: 8px;
			width: auto;
			font-size: 14px;

			&:hover {
				background: var(--primary-200);
			}

			i {
				font-size: 12px;
			}
		}

		.quiz-info {
			h1 {
				color: var(--primary-900);
				margin: 0 0 10px 0;
			}

			.quiz-description {
				color: var(--primary-700);
				margin-bottom: 10px;
				font-size: 16px;
			}

			.quiz-meta {
				color: var(--primary-600);
				font-size: 14px;
				margin: 0;
			}
		}
	}

	.global-stats {
		margin-bottom: 40px;

		h2 {
			color: var(--primary-900);
			margin-bottom: 20px;
		}

		.stats-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 20px;
		}

		.stat-card {
			background: var(--primary-50);
			border: 1px solid var(--primary-200);
			color: var(--primary-800);
			border-radius: 8px;
			padding: 24px;
			text-align: center;

			.stat-number {
				font-size: 2.5rem;
				font-weight: bold;
				margin-bottom: 8px;

				&.excellent {
					color: #059669;
				}
				&.good {
					color: #0891b2;
				}
				&.average {
					color: #d97706;
				}
				&.poor {
					color: #dc2626;
				}
			}

			.stat-label {
				color: var(--primary-700);
				font-size: 14px;
			}
		}
	}

	.participations,
	.question-stats {
		margin-bottom: 40px;

		h2 {
			color: var(--primary-900);
			margin-bottom: 20px;
		}
	}

	.participations-table {
		background: var(--primary-50);
		border: 1px solid var(--primary-200);
		border-radius: 8px;
		overflow: hidden;

		.table-header,
		.table-row {
			display: grid;
			grid-template-columns: 2fr 1fr 1fr 1.5fr;
			padding: 16px;
			gap: 16px;
		}

		.table-header {
			background: var(--primary-100);
			font-weight: 600;
			color: var(--primary-900);
		}

		.table-row {
			border-top: 1px solid var(--primary-200);

			&:hover {
				background: var(--primary-100);
			}

			.participant-name {
				font-weight: 500;
				color: var(--primary-900);
			}

			.score {
				font-weight: 600;

				&.excellent {
					color: #059669;
				}
				&.good {
					color: #0891b2;
				}
				&.average {
					color: #d97706;
				}
				&.poor {
					color: #dc2626;
				}
			}

			.date {
				color: var(--primary-600);
				font-size: 14px;
			}
		}
	}

	.question-analysis {
		background: var(--primary-50);
		border: 1px solid var(--primary-200);
		border-radius: 8px;
		padding: 24px;
		margin-bottom: 20px;

		.question-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12px;

			h3 {
				color: var(--primary-900);
				margin: 0;
			}

			.success-rate {
				font-weight: 600;
				padding: 4px 12px;
				border-radius: 12px;
				font-size: 14px;

				&.excellent {
					background: #d1fae5;
					color: #059669;
				}
				&.good {
					background: #cffafe;
					color: #0891b2;
				}
				&.average {
					background: #fed7aa;
					color: #d97706;
				}
				&.poor {
					background: #fee2e2;
					color: #dc2626;
				}
			}
		}

		.question-text {
			color: var(--primary-800);
			margin-bottom: 20px;
			font-size: 16px;
		}

		.question-details {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 24px;

			@media (max-width: 768px) {
				grid-template-columns: 1fr;
			}
		}

		.correct-answers-info {
			ul {
				margin: 8px 0 0 20px;
				color: var(--primary-700);
			}
		}

		.answer-distribution {
			h4 {
				color: var(--primary-900);
				margin-bottom: 12px;
			}

			.distribution-item {
				margin-bottom: 12px;

				.option-text {
					display: block;
					color: var(--primary-800);
					margin-bottom: 4px;
				}

				.count {
					font-size: 12px;
					color: var(--primary-600);
					float: right;
				}

				.progress-bar {
					background: var(--primary-200);
					height: 6px;
					border-radius: 3px;
					overflow: hidden;
					clear: both;

					.progress-fill {
						background: var(--primary-500);
						height: 100%;
						transition: width 0.3s ease;
					}
				}
			}
		}
	}

	.no-data {
		text-align: center;
		padding: 60px 20px;

		.empty-state {
			i {
				font-size: 4rem;
				color: var(--primary-400);
				margin-bottom: 20px;
			}

			h2 {
				color: var(--primary-900);
				margin-bottom: 10px;
			}

			p {
				color: var(--primary-700);
				margin-bottom: 30px;
			}
		}
	}

	.btn-primary,
	.btn-secondary {
		padding: 12px 24px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 16px;
		font-weight: 500;
	}

	.btn-primary {
		background: var(--primary-600);
		color: white;

		&:hover {
			background: var(--primary-700);
		}
	}

	.btn-secondary {
		background: var(--primary-100);
		color: var(--primary-800);
		border: 1px solid var(--primary-300);

		&:hover {
			background: var(--primary-200);
		}
	}
</style>
