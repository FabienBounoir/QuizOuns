import { userService } from "$lib/server/services/user.service";
import { quizService } from "$lib/server/services/quiz.service.js";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ request, cookies }) => {
	try {
		console.log("cookies", cookies)
		const sessionId = cookies.get("sessionId");
		if (!sessionId) {
			return json({ error: "Non authentifié" }, { status: 401 });
		}

		const user = await userService.getFromJWT(sessionId);
		if (!user || user._id === "-1") {
			return json({ error: "Utilisateur non trouvé" }, { status: 401 });
		}

		const quizData = await request.json();
		if (!quizData.title || !quizData.questions || quizData.questions.length === 0) {
			return json({ error: "Titre et questions requis" }, { status: 400 });
		}

		for (const question of quizData.questions) {
			if (!question.text || !question.options || question.options.length < 2) {
				return json({ error: "Chaque question doit avoir un texte et au moins 2 options" }, { status: 400 });
			}

			const correctAnswers = question.options.filter((option) => option.isCorrect);
			if (correctAnswers.length === 0) {
				return json({ error: "Chaque question doit avoir au moins une réponse correcte" }, { status: 400 });
			}

			if (question.type === 'single' && correctAnswers.length > 1) {
				return json({ error: "Une question à réponse unique ne peut avoir qu'une seule réponse correcte" }, { status: 400 });
			}
		}

		const createdQuiz = await quizService.createQuiz(quizData, user._id.toString());

		return json({ success: true, quiz: createdQuiz });
	} catch (error) {
		console.error("Erreur lors de la création du quiz:", error);
		return json({ error: "Erreur serveur" }, { status: 500 });
	}
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ cookies, url }) => {
	try {
		const sessionId = cookies.get("sessionId");
		if (!sessionId) {
			return json({ error: "Non authentifié" }, { status: 401 });
		}

		const user = await userService.getFromJWT(sessionId);
		if (!user || user._id === "-1") {
			return json({ error: "Utilisateur non trouvé" }, { status: 401 });
		}

		const pageParam = url.searchParams.get('page');
		const limitParam = url.searchParams.get('limit');
		const searchParam = url.searchParams.get('search');

		if (!pageParam && !limitParam && !searchParam) {
			const quizzes = await quizService.getUserQuizzes(user._id.toString());
			return json({ quizzes });
		}

		const page = pageParam ? parseInt(pageParam) : 1;
		const limit = limitParam ? parseInt(limitParam) : 6;
		const search = searchParam || '';

		const result = await quizService.getUserQuizzes(user._id.toString(), {
			page,
			limit,
			search
		});

		return json(result);
	} catch (error) {
		console.error("Erreur lors de la récupération des quiz:", error);
		return json({ error: "Erreur serveur" }, { status: 500 });
	}
};
