<script>
	export let question;
	export let onDelete;
	export let questionIndex;

	const questionTypes = [
		{ value: 'single', label: 'Réponse unique' },
		{ value: 'multiple', label: 'Choix multiple' }
	];

	function addOption() {
		question.options = [...question.options, { text: '', isCorrect: false }];
	}

	function removeOption(index) {
		question.options = question.options.filter((_, i) => i !== index);
	}

	function toggleCorrect(index) {
		if (question.type === 'single') {
			question.options = question.options.map((option, i) => ({
				...option,
				isCorrect: i === index
			}));
		} else {
			question.options[index].isCorrect = !question.options[index].isCorrect;
		}
	}
</script>

<div class="question-form">
	<div class="question-header">
		<h3>Question {questionIndex + 1}</h3>
		<button type="button" onclick={() => onDelete(questionIndex)} class="delete-btn">
			Supprimer
		</button>
	</div>

	<div class="form-group">
		<label>Type de question :</label>
		<select bind:value={question.type}>
			{#each questionTypes as type}
				<option value={type.value}>{type.label}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label>Question :</label>
		<textarea bind:value={question.text} placeholder="Tapez votre question ici..."></textarea>
	</div>

	<div class="form-group">
		<label>Options de réponse :</label>
		{#each question.options as option, index}
			<div class="option-row">
				<button
					type="button"
					onclick={() => toggleCorrect(index)}
					class="correct-btn"
					class:active={option.isCorrect}
					title={option.isCorrect ? 'Réponse correcte' : 'Marquer comme correcte'}
				>
					{#if option.isCorrect}
						<i class="fa-solid fa-check"></i>
					{:else}
						<i class="fa-regular fa-circle"></i>
					{/if}
				</button>
				<input
					type="text"
					bind:value={option.text}
					placeholder="Option {index + 1}"
					class="option-input"
				/>
				<button type="button" onclick={() => removeOption(index)} class="remove-option"> × </button>
			</div>
		{/each}
		<button type="button" onclick={addOption} class="add-option"> + Ajouter une option </button>
	</div>
</div>

<style lang="scss">
	.question-form {
		border: 1px solid var(--primary-300);
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 20px;
		background: var(--primary-50);
	}

	.question-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;

		h3 {
			margin: 0;
		}
	}

	.form-group {
		margin-bottom: 15px;

		label {
			display: block;
			margin-bottom: 5px;
			font-weight: bold;
		}

		input,
		textarea,
		select {
			width: 100%;
			padding: 8px;
			border: 1px solid var(--primary-300);
			border-radius: 4px;

			&:focus {
				outline: none;
				border-color: var(--primary-600);
				box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.25);
			}
		}

		textarea {
			min-height: 80px;
			resize: vertical;
		}
	}

	.option-row {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;

		.correct-btn {
			background: var(--primary-100);
			color: var(--primary-600);
			border: 2px solid var(--primary-300);
			width: 36px;
			height: 36px;
			border-radius: 50%;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.2s ease;
			flex-shrink: 0;

			&:hover {
				background: var(--primary-200);
				border-color: var(--primary-500);
			}

			&.active {
				background: var(--primary-600);
				color: white;
				border-color: var(--primary-600);
			}

			i {
				font-size: 14px;
			}
		}

		.option-input {
			flex: 1;
			transition: all 0.2s ease;

			&:hover {
				border-color: var(--primary-500);
			}
		}

		.remove-option {
			background: var(--primary-600);
			color: white;
			border: none;
			padding: 6px 12px;
			border-radius: 4px;
			cursor: pointer;
			font-size: 12px;
			width: 32px !important;
			height: 32px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			&:hover {
				background: var(--primary-700);
			}
		}
	}

	.delete-btn {
		background: var(--primary-600);
		color: white;
		border: none;
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		margin-top: 10px;
		align-self: flex-start;
		width: auto !important;

		&:hover {
			background: var(--primary-700);
		}
	}

	.add-option {
		background: var(--primary-600);
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		margin-top: 10px;
		width: 100% !important;

		&:hover {
			background: var(--primary-700);
		}
	}
</style>
