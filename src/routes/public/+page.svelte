<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { goto } from '$app/navigation';
	import { snacks } from '$lib/stores/snacks';
	import { user } from '$lib/stores/user';

	let quizzes = $state([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let currentPage = $state(1);
	let hasNextPage = $state(true);
	let totalQuizzes = $state(0);
	let searchQuery = $state('');
	let searchTimeout = null;

	const LIMIT = 12;

	async function loadQuizzes(page = 1, append = false, search = '') {
		try {
			if (page === 1) {
				loading = true;
			} else {
				loadingMore = true;
			}

			let url = `/public-quiz?page=${page}&limit=${LIMIT}`;
			if (search.trim()) {
				url += `&search=${encodeURIComponent(search.trim())}`;
			}

			const response = await api.get(url);

			if (append) {
				quizzes = [...quizzes, ...(response.quizzes || [])];
			} else {
				quizzes = response.quizzes || [];
			}

			if (response.pagination) {
				hasNextPage = response.pagination.hasNextPage;
				totalQuizzes = response.pagination.totalQuizzes;
			}
		} catch (error) {
			console.error('Erreur lors du chargement des quiz:', error);
			snacks.error('Erreur lors du chargement des quiz');
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	function handleScroll() {
		const scrollTop = window.scrollY;
		const windowHeight = window.innerHeight;
		const docHeight = document.documentElement.scrollHeight;

		if (scrollTop + windowHeight >= docHeight - 200 && !loadingMore && hasNextPage) {
			currentPage++;
			loadQuizzes(currentPage, true, searchQuery);
		}
	}

	function handleSearch() {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(() => {
			currentPage = 1;
			hasNextPage = true;
			loadQuizzes(1, false, searchQuery);
		}, 500);
	}

	function clearSearch() {
		searchQuery = '';
		currentPage = 1;
		hasNextPage = true;
		loadQuizzes(1, false, '');
	}

	onMount(async () => {
		await loadQuizzes(1, false, '');

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}
		};
	});

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function playQuiz(quizId) {
		goto(`/quiz/${quizId}`);
	}

	function createQuiz() {
		if ($user && $user._id !== '-1') {
			goto('/new');
		} else {
			goto('/login');
		}
	}
</script>

<div class="public-quizzes">
	<header>
		<h1>Quiz disponibles</h1>
		<p>Choisissez un quiz et testez vos connaissances !</p>
	</header>

	<div class="search-section">
		<div class="search-container">
			<div class="search-input-wrapper">
				<i class="fa-solid fa-magnifying-glass search-icon"></i>
				<input
					type="text"
					placeholder="Rechercher un quiz par titre ou description..."
					bind:value={searchQuery}
					oninput={handleSearch}
					class="search-input"
				/>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="loading">Chargement des quiz...</div>
	{:else if quizzes.length === 0}
		<div class="empty-state">
			{#if searchQuery.trim()}
				<h2>Aucun quiz trouvé</h2>
				<p>Aucun quiz ne correspond à votre recherche "{searchQuery}".</p>
				<button class="clear-search-btn-large" onclick={clearSearch}> Voir tous les quiz </button>
			{:else}
				<h2>Aucun quiz disponible</h2>
				<p>Revenez plus tard, de nouveaux quiz seront bientôt disponibles !</p>
			{/if}
		</div>
	{:else}
		<div class="quiz-grid">
			{#each quizzes as quiz}
				<div class="quiz-card">
					<h3>{quiz.title}</h3>
					{#if quiz.description}
						<p class="description">{quiz.description}</p>
					{/if}
					<div class="quiz-meta">
						<div class="meta-stats">
							<span class="question-count">
								{quiz.questionCount} question{quiz.questionCount > 1 ? 's' : ''}
							</span>
							<span class="participation-count">
								{quiz.participationCount || 0} <i class="fa-solid fa-user"></i>
							</span>
						</div>
						<span class="created-date">
							Crée le {formatDate(quiz.createdAt)}
						</span>
					</div>
					<button class="play-btn" onclick={() => playQuiz(quiz._id)}> Jouer maintenant </button>
				</div>
			{/each}
		</div>

		{#if loadingMore}
			<div class="loading-more">
				<div class="spinner"></div>
				<p>Chargement de plus de quiz...</p>
			</div>
		{/if}

		{#if !hasNextPage && quizzes.length > 0}
			<div class="create-quiz-cta">
				<div class="cta-content">
					<p>
						Vous avez parcouru tous nos quiz disponibles. Et si c'était à votre tour de partager vos
						connaissances ?
					</p>
					<button class="create-quiz-btn" onclick={createQuiz}>
						<i class="fa-solid fa-plus"></i>
						Créer mon premier quiz
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style lang="scss">
	.public-quizzes {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	header {
		text-align: center;
		margin-bottom: 40px;

		h1 {
			margin: 0 0 10px 0;
			color: var(--primary-900);
			font-size: 2.5rem;
		}

		p {
			color: var(--primary-600);
			font-size: 1.2rem;
			margin-bottom: 10px;
		}

		.total-count {
			color: var(--primary-500);
			font-size: 14px;
			font-weight: 500;
			background: var(--primary-100);
			display: inline-block;
			padding: 4px 12px;
			border-radius: 12px;
		}
	}

	.loading {
		text-align: center;
		padding: 40px;
		color: var(--primary-600);
		font-size: 18px;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 16px;
		border: 2px dashed var(--primary-300);
		margin: 2rem 0;

		h2 {
			margin-bottom: 1rem;
			color: var(--primary-800);
			font-size: 1.5rem;
		}

		p {
			font-size: 1rem;
			color: var(--primary-600);
			margin-bottom: 1.5rem;
		}
	}

	.search-section {
		margin-bottom: 2rem;
	}

	.search-container {
		max-width: 600px;
		margin: 0 auto;
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		padding: 1rem 1rem 1rem 3rem;
		border: 2px solid var(--primary-200);
		border-radius: 1rem;
		font-size: 1rem;
		background: white;
		transition: border-color 0.2s;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--primary-500);
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--primary-400);
		pointer-events: none;
		z-index: 1;
	}

	.clear-search-btn {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: var(--primary-500);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
		z-index: 1;
	}

	.clear-search-btn:hover {
		background-color: var(--primary-100);
		color: var(--primary-700);
	}

	.clear-search-btn-large {
		background: var(--primary-600);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		margin-top: 1rem;
	}

	.clear-search-btn-large:hover {
		background: var(--primary-700);
	}

	.quiz-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;

		@media (max-width: 768px) {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		@media (min-width: 1200px) {
			grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		}
	}

	.quiz-card {
		background: white;
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(251, 146, 60, 0.1);
		border: 2px solid var(--primary-100);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 4px;
			background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
		}

		&:hover {
			transform: translateY(-4px);
			box-shadow: 0 8px 32px rgba(251, 146, 60, 0.2);
			border-color: var(--primary-300);
		}

		h3 {
			margin: 0 0 1rem 0;
			color: var(--primary-900);
			font-size: 1.25rem;
			font-weight: 700;
			line-height: 1.3;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.description {
			color: var(--primary-700);
			margin-bottom: 1.5rem;
			line-height: 1.6;
			font-size: 0.875rem;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			min-height: 2rem;
		}

		.quiz-meta {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
			margin-bottom: 1.5rem;
			padding: 1rem;
			background: var(--primary-50);
			border-radius: 12px;
			border: 1px solid var(--primary-100);

			.meta-stats {
				display: flex;
				gap: 0.75rem;
				flex-wrap: wrap;
			}

			.question-count {
				background: var(--primary-600);
				color: white;
				padding: 0.375rem 0.75rem;
				border-radius: 20px;
				font-weight: 600;
				font-size: 0.75rem;
				display: flex;
				align-items: center;
				gap: 0.25rem;
			}

			.participation-count {
				background: var(--primary-200);
				color: var(--primary-800);
				padding: 0.375rem 0.75rem;
				border-radius: 20px;
				font-weight: 600;
				font-size: 0.75rem;
				display: flex;
				align-items: center;
				gap: 0.375rem;

				i {
					font-size: 0.7rem;
				}
			}

			.created-date {
				font-size: 0.75rem;
				color: var(--primary-700);
				font-style: italic;
				padding-top: 0.25rem;
				border-top: 1px solid var(--primary-200);
			}
		}

		.play-btn {
			width: 100%;
			background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
			color: white;
			border: none;
			padding: 0.875rem 1.5rem;
			border-radius: 12px;
			cursor: pointer;
			font-size: 1rem;
			font-weight: 600;
			transition: all 0.3s ease;
			position: relative;
			overflow: hidden;

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
				box-shadow: 0 4px 16px rgba(251, 146, 60, 0.3);

				&::before {
					left: 100%;
				}
			}

			&:active {
				transform: translateY(0);
			}
		}
	}

	.loading-more {
		text-align: center;
		padding: 40px 20px;
		color: var(--primary-600);

		.spinner {
			width: 24px;
			height: 24px;
			border: 3px solid var(--primary-200);
			border-top: 3px solid var(--primary-600);
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin: 0 auto 16px;
		}

		p {
			font-size: 16px;
			margin: 0;
		}
	}

	.create-quiz-cta {
		text-align: center;
		padding: 60px 20px;
		margin: 40px 0;

		.cta-content {
			background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
			padding: 40px 30px;
			border-radius: 16px;
			border: 2px solid var(--primary-200);
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
			max-width: 600px;
			margin: 0 auto;

			h3 {
				color: var(--primary-900);
				font-size: 1.8rem;
				margin: 0 0 16px 0;
				font-weight: 700;
			}

			p {
				color: var(--primary-700);
				font-size: 16px;
				line-height: 1.6;
				margin: 0 0 24px 0;
			}

			.create-quiz-btn {
				background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
				color: white;
				border: none;
				padding: 16px 32px;
				border-radius: 12px;
				cursor: pointer;
				font-size: 18px;
				font-weight: 600;
				transition: all 0.3s ease;
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
				display: inline-flex;
				align-items: center;
				gap: 8px;

				&:hover {
					transform: translateY(-2px);
					box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
					background: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-800) 100%);
				}

				&:active {
					transform: translateY(0);
				}

				i {
					font-size: 16px;
				}
			}

			.cta-subtitle {
				font-size: 14px;
				color: var(--primary-600);
				margin: 16px 0 0 0;
				font-style: italic;
			}
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
