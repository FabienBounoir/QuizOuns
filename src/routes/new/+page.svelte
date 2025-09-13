<script>
	import { user } from '$lib/stores/user';
	import { snacks } from '$lib/stores/snacks';
	import { api } from '$lib/utils/api';
	import { goto } from '$app/navigation';
	import QuestionForm from '$lib/components/QuestionForm.svelte';

	let quiz = {
		title: '',
		description: '',
		isPrivate: false,
		questions: []
	};

	let isLoading = false;

	function createDefaultQuestion() {
		return {
			type: 'single',
			text: '',
			options: [
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false }
			]
		};
	}

	function addQuestion() {
		quiz.questions = [...quiz.questions, createDefaultQuestion()];
	}

	function deleteQuestion(index) {
		quiz.questions = quiz.questions.filter((_, i) => i !== index);
	}

	async function handleSubmit(event) {
		event.preventDefault();

		if (!quiz.title.trim()) {
			snacks.error('Le titre est requis');
			return;
		}

		if (quiz.questions.length === 0) {
			snacks.error('Ajoutez au moins une question');
			return;
		}

		// Validation des questions
		for (let i = 0; i < quiz.questions.length; i++) {
			const question = quiz.questions[i];

			if (!question.text.trim()) {
				snacks.error(`La question ${i + 1} doit avoir un texte`);
				return;
			}

			const filledOptions = question.options.filter((opt) => opt.text.trim());
			if (filledOptions.length < 2) {
				snacks.error(`La question ${i + 1} doit avoir au moins 2 options`);
				return;
			}

			const correctAnswers = question.options.filter((opt) => opt.isCorrect && opt.text.trim());
			if (correctAnswers.length === 0) {
				snacks.error(`La question ${i + 1} doit avoir au moins une réponse correcte`);
				return;
			}
		}

		isLoading = true;

		try {
			// Nettoyer les questions avant l'envoi
			const cleanQuiz = {
				...quiz,
				questions: quiz.questions.map((question) => ({
					...question,
					options: question.options.filter((opt) => opt.text.trim())
				}))
			};

			const response = await api.post('/quiz', cleanQuiz);

			if (response.success) {
				snacks.success('Quiz créé avec succès!');
				goto('/admin'); // Rediriger vers la page admin
			} else {
				snacks.error(response.error || 'Erreur lors de la création');
			}
		} catch (error) {
			console.error('Erreur:', error);
			snacks.error('Erreur lors de la création du quiz');
		} finally {
			isLoading = false;
		}
	}

	// Ajouter une question par défaut au démarrage
	if (quiz.questions.length === 0) {
		addQuestion();
	}
</script>

<div class="quiz-creator">
	<h1>Créer un nouveau Quiz</h1>

	<form onsubmit={handleSubmit}>
		<div class="quiz-info">
			<div class="form-group">
				<label for="title">Titre du quiz *</label>
				<input
					id="title"
					type="text"
					bind:value={quiz.title}
					placeholder="Titre du quiz"
					required
				/>
			</div>

			<div class="form-group">
				<label for="description">Description</label>
				<textarea
					id="description"
					bind:value={quiz.description}
					placeholder="Description du quiz (optionnel)"
				></textarea>
			</div>

			<div class="form-group">
				<label class="privacy-label">
					<input type="checkbox" bind:checked={quiz.isPrivate} />
					Quiz privé (ne sera pas visible publiquement)
				</label>
				<p class="privacy-help">
					{#if quiz.isPrivate}
						Ce quiz sera uniquement accessible par lien direct et n'apparaîtra pas dans la liste
						publique.
						<br /><strong>Avantages :</strong> Contrôle total sur qui peut y accéder, idéal pour des
						évaluations ou des quiz internes.
					{:else}
						Ce quiz sera visible dans la liste des quiz publics et accessible à tous.
						<br /><strong>Avantages :</strong> Plus de visibilité, peut être découvert par d'autres utilisateurs.
					{/if}
				</p>
			</div>
		</div>

		<div class="questions-section">
			<div class="questions-header">
				<h2>Questions ({quiz.questions.length})</h2>
			</div>

			{#each quiz.questions as question, index}
				<QuestionForm bind:question onDelete={deleteQuestion} questionIndex={index} />
			{/each}

			{#if quiz.questions.length === 0}
				<p class="no-questions">
					Aucune question ajoutée. Cliquez sur "Ajouter une question" pour commencer.
				</p>
			{/if}
			<button type="button" onclick={addQuestion} class="add-question-btn">
				+ Ajouter une question
			</button>
		</div>

		<div class="submit-section">
			<button type="submit" disabled={isLoading} class="submit-btn">
				{isLoading ? 'Création en cours...' : 'Créer le Quiz'}
			</button>
		</div>
	</form>
</div>

<style lang="scss">
	.quiz-creator {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		min-height: calc(100vh - 80px); // Hauteur minimale moins la navbar
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	h1 {
		text-align: center;
		margin-bottom: 30px;
		color: var(--primary-900);
	}

	.quiz-info {
		background: var(--primary-50);
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 30px;
		border: 1px solid var(--primary-200);
	}

	.form-group {
		margin-bottom: 15px;

		label {
			display: block;
			margin-bottom: 5px;
			font-weight: bold;
			color: var(--primary-700);
		}

		input,
		textarea {
			width: 100%;
			padding: 10px;
			border: 1px solid var(--primary-300);
			border-radius: 4px;
			font-size: 16px;

			&:focus {
				outline: none;
				border-color: var(--primary-600);
				box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.25);
			}
		}

		textarea {
			min-height: 100px;
			resize: vertical;
		}

		.privacy-label {
			display: flex;
			align-items: center;
			gap: 8px;
			cursor: pointer;
			font-weight: normal;

			input[type='checkbox'] {
				width: auto;
				margin: 0;
			}
		}

		.privacy-help {
			margin: 8px 0 0 0;
			font-size: 14px;
			color: var(--primary-600);
			font-style: italic;
		}
	}

	.questions-section {
		margin-bottom: 30px;
	}

	.questions-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;

		h2 {
			margin: 0;
			color: var(--primary-900);
		}
	}

	.add-question-btn {
		background: var(--primary-600);
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;

		&:hover {
			background: var(--primary-700);
		}
	}

	.no-questions {
		text-align: center;
		color: var(--primary-600);
		font-style: italic;
		padding: 40px;
		background: var(--primary-50);
		border-radius: 8px;
		border: 1px solid var(--primary-200);
	}

	.submit-section {
		text-align: center;
		border-top: 1px solid var(--primary-200);
		padding-top: 20px;
	}

	.submit-btn {
		background: var(--primary-600);
		color: white;
		border: none;
		padding: 15px 40px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		font-weight: bold;

		&:hover:not(:disabled) {
			background: var(--primary-700);
		}

		&:disabled {
			background: var(--primary-400);
			cursor: not-allowed;
		}
	}
</style>
