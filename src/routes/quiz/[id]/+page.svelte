<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { snacks } from '$lib/stores/snacks';

	let quizId;
	let quiz = $state(null);
	let loading = $state(true);
	let gameState = $state('username'); // 'username', 'playing', 'finished'
	let username = $state('');
	let currentQuestionIndex = $state(0);
	let answers = $state([]);
	let result = $state(null);
	let submitting = $state(false);
	let canSubmit = $state(false);

	onMount(async () => {
		quizId = $page.params.id;
		await loadQuiz();
	});

	async function loadQuiz() {
		try {
			const response = await api.get(`/quiz/${quizId}`);
			quiz = response.quiz;
			// Initialiser le tableau de réponses
			answers = new Array(quiz.questions.length).fill(null);
		} catch (error) {
			console.error('Erreur lors du chargement du quiz:', error);
			snacks.error('Quiz non trouvé');
		} finally {
			loading = false;
		}
	}

	function startQuiz() {
		if (!username.trim()) {
			snacks.error('Veuillez entrer votre nom');
			return;
		}
		gameState = 'playing';
	}

	function selectAnswer(questionIndex, optionId) {
		const question = quiz.questions[questionIndex];
		console.log(
			'Selecting answer for question',
			questionIndex,
			'option',
			optionId,
			'type:',
			question.type
		);

		// Créer une copie du tableau pour déclencher la réactivité en Svelte 5
		const newAnswers = [...answers];

		if (question.type === 'single') {
			newAnswers[questionIndex] = optionId;
		} else {
			// Pour les choix multiples
			if (!Array.isArray(newAnswers[questionIndex])) {
				newAnswers[questionIndex] = [];
			}

			const currentAnswers = [...newAnswers[questionIndex]];
			const index = currentAnswers.indexOf(optionId);

			if (index > -1) {
				currentAnswers.splice(index, 1);
			} else {
				currentAnswers.push(optionId);
			}

			newAnswers[questionIndex] = currentAnswers;
		}

		// Assigner le nouveau tableau pour déclencher la réactivité
		answers = newAnswers;
		console.log('Updated answers:', answers);
	}

	function nextQuestion() {
		// Vérifier qu'au moins une réponse est sélectionnée
		if (!isAnswered(currentQuestionIndex)) {
			snacks.error('Veuillez sélectionner au moins une réponse avant de continuer');
			return;
		}

		if (currentQuestionIndex < quiz.questions.length - 1) {
			currentQuestionIndex++;
		}
	}

	function previousQuestion() {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex--;
		}
	}

	async function submitQuiz() {
		submitting = true;
		console.log('Submitting quiz with answers:', answers);
		console.log('Quiz questions:', quiz?.questions);

		try {
			const response = await api.post(`/quiz/${quizId}`, {
				username: username.trim(),
				answers
			});

			console.log('Submit response:', response);

			if (response.success) {
				result = response.result;
				gameState = 'finished';
			} else {
				snacks.error(response.error || 'Erreur lors de la soumission');
			}
		} catch (error) {
			console.error('Erreur lors de la soumission:', error);
			snacks.error('Erreur lors de la soumission du quiz');
		} finally {
			submitting = false;
		}
	}

	function isAnswered(questionIndex) {
		const answer = answers[questionIndex];
		console.log('Checking answer for question', questionIndex, ':', answer);

		if (Array.isArray(answer)) {
			return answer.length > 0;
		}
		return answer !== null && answer !== undefined;
	}

	const canSubmitQuiz = () => {
		console.log('Checking if can submit. Current answers:', answers);
		if (!quiz || !answers.length) {
			console.log('Cannot submit: no quiz or no answers');
			return false;
		}

		// Intégrer la logique directement ici pour la réactivité
		const allAnswered = answers.every((answer, index) => {
			if (Array.isArray(answer)) {
				return answer.length > 0;
			}
			return answer !== null && answer !== undefined;
		});

		console.log('Can submit:', allAnswered, 'Answers:', answers);
		return allAnswered;
	};

	const currentQuestion = $derived(quiz?.questions[currentQuestionIndex]);
	const isLastQuestion = $derived(currentQuestionIndex === quiz?.questions.length - 1);
	const isFirstQuestion = $derived(currentQuestionIndex === 0);

	$effect(() => {
		canSubmit = canSubmitQuiz();
	});
</script>

<div class="quiz-container">
	{#if loading}
		<div class="loading">Chargement du quiz...</div>
	{:else if !quiz}
		<div class="error">Quiz non trouvé</div>
	{:else if gameState === 'username'}
		<!-- Écran de saisie du nom -->
		<div class="username-screen">
			{#if quiz.isPrivate}
				<div class="private-notice">🔒 Quiz privé - Accessible uniquement par lien direct</div>
			{/if}

			<h1>{quiz.title}</h1>
			{#if quiz.description}
				<p class="description">{quiz.description}</p>
			{/if}

			<div class="quiz-info">
				<p>
					<strong>{quiz.questions.length}</strong> question{quiz.questions.length > 1 ? 's' : ''}
				</p>
			</div>

			<div class="username-form">
				<label for="username">Votre nom :</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					placeholder="Entrez votre nom"
					onkeydown={(e) => e.key === 'Enter' && startQuiz()}
				/>
				<button onclick={startQuiz} disabled={!username.trim()}>Commencer le quiz</button>
			</div>
		</div>
	{:else if gameState === 'playing'}
		<!-- Interface de jeu -->
		<div class="quiz-game">
			<div class="quiz-header">
				<h1>{quiz.title}</h1>
				<div class="progress">
					Question {currentQuestionIndex + 1} sur {quiz.questions.length}
					<div class="progress-bar">
						<div
							class="progress-fill"
							style="width: {((currentQuestionIndex + 1) / quiz.questions.length) * 100}%"
						></div>
					</div>
				</div>
			</div>

			<div class="question-card">
				<h2>{currentQuestion.text}</h2>

				<div class="options">
					{#each currentQuestion.options as option}
						<button
							type="button"
							class="option"
							class:selected={currentQuestion.type === 'single'
								? answers[currentQuestionIndex] === option.id
								: Array.isArray(answers[currentQuestionIndex]) &&
									answers[currentQuestionIndex].includes(option.id)}
							onclick={() => selectAnswer(currentQuestionIndex, option.id)}
						>
							<span>{option.text}</span>
						</button>
					{/each}
				</div>

				{#if !isAnswered(currentQuestionIndex)}
					<div class="answer-hint">
						{#if currentQuestion.type === 'single'}
							💡 Sélectionnez une réponse pour continuer
						{:else}
							💡 Sélectionnez une ou plusieurs réponses pour continuer
						{/if}
					</div>
				{/if}
			</div>

			<div class="navigation">
				<button onclick={previousQuestion} disabled={isFirstQuestion} class="nav-btn">
					← Précédent
				</button>

				{#if isLastQuestion}
					<button onclick={submitQuiz} disabled={!canSubmit || submitting} class="submit-btn">
						{submitting ? 'Envoi...' : 'Terminer le quiz'}
					</button>
				{:else}
					<button
						onclick={nextQuestion}
						disabled={!isAnswered(currentQuestionIndex)}
						class="nav-btn next"
					>
						Suivant →
					</button>
				{/if}
			</div>

			<!-- Indicateur de progression des réponses -->
			<div class="answer-progress">
				{#each quiz?.questions || [] as _, index}
					<button
						type="button"
						class="answer-indicator {isAnswered(index) ? 'answered' : ''} {index ===
						currentQuestionIndex
							? 'current'
							: ''}"
						onclick={() => (currentQuestionIndex = index)}
					>
						{index + 1}
					</button>
				{/each}
			</div>
		</div>
	{:else if gameState === 'finished'}
		<!-- Écran de résultats -->
		<div class="results-screen">
			<h1>Quiz terminé !</h1>
			<div class="results">
				<h2>Merci {username} !</h2>
				<div class="score">
					<div class="score-circle">
						<span class="score-percentage">{result?.score || 0}%</span>
					</div>
					<p>
						Vous avez obtenu <strong>{result?.correctAnswers || 0}</strong>
						bonne{(result?.correctAnswers || 0) > 1 ? 's' : ''} réponse{(result?.correctAnswers ||
							0) > 1
							? 's'
							: ''}
						sur <strong>{result?.totalQuestions || 0}</strong>
					</p>
				</div>
			</div>

			<div class="action-buttons">
				<button onclick={() => window.location.reload()} class="restart-btn">
					Refaire le quiz
				</button>
				<button onclick={() => (window.location.href = '/')} class="home-btn">
					Retour à l'accueil
				</button>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.quiz-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		min-height: calc(100vh - 80px);
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.loading,
	.error {
		text-align: center;
		padding: 40px;
		font-size: 18px;
	}

	.username-screen {
		text-align: center;
		padding: 40px 20px;

		.private-notice {
			background: var(--primary-100);
			color: var(--primary-800);
			padding: 12px 20px;
			border-radius: 6px;
			margin-bottom: 20px;
			border: 1px solid var(--primary-300);
			font-size: 14px;
		}

		h1 {
			margin-bottom: 15px;
			color: var(--primary-900);
		}

		.description {
			color: var(--primary-700);
			margin-bottom: 30px;
			font-size: 16px;
		}

		.quiz-info {
			background: var(--primary-50);
			padding: 20px;
			border-radius: 8px;
			margin-bottom: 30px;
			border: 1px solid var(--primary-200);

			p {
				margin: 0;
				font-size: 18px;
			}
		}

		.username-form {
			max-width: 400px;
			margin: 0 auto;

			label {
				display: block;
				margin-bottom: 10px;
				font-weight: bold;
				text-align: left;
			}

			input {
				width: 100%;
				padding: 12px;
				border: 1px solid var(--primary-300);
				border-radius: 6px;
				font-size: 16px;
				margin-bottom: 20px;

				&:focus {
					outline: none;
					border-color: var(--primary-600);
					box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.25);
				}
			}

			button {
				width: 100%;
				background: var(--primary-600);
				color: white;
				border: none;
				padding: 12px 24px;
				border-radius: 6px;
				font-size: 16px;
				cursor: pointer;

				&:hover:not(:disabled) {
					background: var(--primary-700);
				}

				&:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
			}
		}
	}

	.quiz-game {
		.quiz-header {
			margin-bottom: 30px;
			text-align: center;

			h1 {
				margin-bottom: 20px;
				color: #333;
				font-weight: 600;
			}

			.progress {
				color: #666;
				font-weight: 500;

				.progress-bar {
					width: 100%;
					height: 10px;
					background: #e5e5e5;
					border-radius: 5px;
					margin-top: 10px;
					overflow: hidden;

					.progress-fill {
						height: 100%;
						background: var(--primary-600);
						transition: width 0.3s ease;
					}
				}
			}
		}

		.question-card {
			background: white;
			border-radius: 8px;
			padding: 30px;
			border: 2px solid #e5e5e5;
			margin-bottom: 30px;

			h2 {
				margin-bottom: 25px;
				color: #222;
				line-height: 1.4;
				font-weight: 600;
				font-size: 1.3rem;
			}

			.options {
				.option {
					display: flex;
					align-items: center;
					padding: 18px 20px;
					border: 2px solid #ddd;
					border-radius: 8px;
					margin-bottom: 12px;
					cursor: pointer;
					transition: all 0.2s ease;
					background: #fafafa;
					width: 100%;
					text-align: left;
					font-size: 16px;

					&:hover {
						background: #f0f0f0;
						border-color: #999;
					}

					span {
						flex: 1;
						color: #333;
						font-weight: 500;
					}

					&.selected {
						background: var(--primary-600);
						border-color: var(--primary-600);
						color: white;

						&:hover {
							background: var(--primary-700);
							border-color: var(--primary-700);
						}

						span {
							color: white;
							font-weight: 600;
						}
					}
				}
			}

			.answer-hint {
				text-align: center;
				color: #666;
				font-style: italic;
				margin-top: 20px;
				padding: 15px;
				background: #f8f8f8;
				border-radius: 8px;
				border: 1px solid #ddd;
				font-size: 15px;
			}
		}

		.navigation {
			display: flex;
			justify-content: space-between;
			margin-bottom: 30px;
			gap: 15px;

			.nav-btn,
			.submit-btn {
				padding: 12px 24px;
				border: none;
				border-radius: 8px;
				cursor: pointer;
				font-size: 15px;
				font-weight: 600;
				transition: all 0.2s ease;

				&:disabled {
					opacity: 0.4;
					cursor: not-allowed;
				}
			}

			.nav-btn {
				background: #666;
				color: white;

				&:hover:not(:disabled) {
					background: #555;
				}

				&.next {
					background: var(--primary-600);

					&:hover:not(:disabled) {
						background: var(--primary-700);
					}
				}
			}

			.submit-btn {
				background: var(--primary-900);
				color: white;

				&:hover:not(:disabled) {
					background: var(--primary-800);
				}
			}
		}

		.answer-progress {
			display: flex;
			justify-content: center;
			gap: 12px;
			flex-wrap: wrap;

			.answer-indicator {
				width: 35px;
				height: 35px;
				border-radius: 8px;
				background: #e5e5e5;
				border: 2px solid #ddd;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				font-size: 14px;
				font-weight: 600;
				transition: all 0.2s ease;
				color: #666;

				&.answered {
					background: var(--primary-500);
					border-color: var(--primary-400);
					color: white;
				}

				&.current {
					background: var(--primary-600);
					border-color: var(--primary-600);
					color: white;
				}

				&:hover {
					border-color: #999;
					background: #f0f0f0;
				}

				&.answered:hover,
				&.current:hover {
					opacity: 0.8;
				}
			}
		}
	}

	.results-screen {
		text-align: center;
		padding: 40px 20px;

		h1 {
			margin-bottom: 40px;
			color: #333;
			font-weight: 600;
			font-size: 2.2rem;
		}

		.results {
			background: white;
			border: 2px solid #e5e5e5;
			border-radius: 12px;
			padding: 40px;
			margin-bottom: 40px;

			h2 {
				margin-bottom: 40px;
				color: #222;
				font-size: 1.5rem;
				font-weight: 600;
			}

			.score {
				margin-bottom: 40px;

				.score-circle {
					width: 140px;
					height: 140px;
					border-radius: 12px;
					background: var(--primary-600);
					display: flex;
					align-items: center;
					justify-content: center;
					margin: 0 auto 30px;
					border: 3px solid var(--primary-700);

					.score-percentage {
						color: white;
						font-size: 28px;
						font-weight: bold;
					}
				}

				p {
					font-size: 18px;
					color: #333;
					line-height: 1.5;
					max-width: 400px;
					margin: 0 auto;

					strong {
						color: var(--primary-900);
						font-weight: 700;
					}
				}
			}
		}

		.action-buttons {
			display: flex;
			gap: 15px;
			justify-content: center;
			flex-wrap: wrap;

			.restart-btn,
			.home-btn {
				background: var(--primary-600);
				color: white;
				border: none;
				padding: 15px 30px;
				border-radius: 8px;
				font-size: 16px;
				font-weight: 600;
				cursor: pointer;
				transition: all 0.2s ease;
				display: flex;
				align-items: center;
				gap: 8px;

				&:hover {
					background: var(--primary-700);
				}
			}

			.home-btn {
				background: #666;

				&:hover {
					background: #555;
				}
			}
		}
	}
</style>
