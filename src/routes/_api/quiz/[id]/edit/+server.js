import { quizService } from "$lib/server/services/quiz.service.js";
import { userService } from "$lib/server/services/user.service.js";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ params, cookies }) => {
    try {
        const sessionId = cookies.get("sessionId");
        if (!sessionId) {
            return json({ error: "Non authentifié" }, { status: 401 });
        }

        const user = await userService.getFromJWT(sessionId);
        if (!user || user._id === "-1") {
            return json({ error: "Utilisateur non trouvé" }, { status: 401 });
        }

        const quiz = await quizService.getQuizById(params.id);

        if (!quiz) {
            return json({ error: "Quiz non trouvé" }, { status: 404 });
        }

        if (quiz.createdBy.toString() !== user._id.toString()) {
            return json({ error: "Non autorisé" }, { status: 403 });
        }

        return json({ quiz });
    } catch (error) {
        console.error("Erreur lors de la récupération du quiz:", error);
        return json({ error: "Erreur serveur" }, { status: 500 });
    }
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const PUT = async ({ params, request, cookies }) => {
    try {
        const sessionId = cookies.get("sessionId");
        if (!sessionId) {
            return json({ error: "Non authentifié" }, { status: 401 });
        }

        // Récupérer l'utilisateur depuis le JWT
        const user = await userService.getFromJWT(sessionId);
        if (!user || user._id === "-1") {
            return json({ error: "Utilisateur non trouvé" }, { status: 401 });
        }

        const quizData = await request.json();

        // Validation basique
        if (!quizData.title || !quizData.questions || quizData.questions.length === 0) {
            return json({ error: "Titre et questions requis" }, { status: 400 });
        }

        // Validation des questions
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

        // Vérifier que le quiz existe et appartient à l'utilisateur
        const existingQuiz = await quizService.getQuizById(params.id);
        if (!existingQuiz) {
            return json({ error: "Quiz non trouvé" }, { status: 404 });
        }

        if (existingQuiz.createdBy.toString() !== user._id.toString()) {
            return json({ error: "Non autorisé" }, { status: 403 });
        }

        // Mettre à jour le quiz
        const updatedQuiz = await quizService.updateQuiz(params.id, quizData, user._id.toString());

        return json({ success: true, quiz: updatedQuiz });
    } catch (error) {
        console.error("Erreur lors de la modification du quiz:", error);
        return json({ error: "Erreur serveur" }, { status: 500 });
    }
};
