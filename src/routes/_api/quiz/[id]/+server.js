import { quizService } from "$lib/server/services/quiz.service.js";
import { participationService } from "$lib/server/services/participation.service.js";
import { userService } from "$lib/server/services/user.service.js";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ params }) => {
    try {
        const quiz = await quizService.getQuizById(params.id);

        if (!quiz) {
            return json({ error: "Quiz non trouvé" }, { status: 404 });
        }

        const publicQuiz = {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions.map((question, index) => ({
                index,
                type: question.type,
                text: question.text,
                options: question.options.map((option, optionIndex) => ({
                    id: optionIndex,
                    text: option.text
                }))
            }))
        };

        return json({ quiz: publicQuiz });
    } catch (error) {
        console.error("Erreur lors de la récupération du quiz:", error);
        return json({ error: "Erreur serveur" }, { status: 500 });
    }
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const POST = async ({ params, request }) => {
    try {
        const { username, answers } = await request.json();

        if (!username || !answers) {
            return json({ error: "Nom d'utilisateur et réponses requis" }, { status: 400 });
        }

        const quiz = await quizService.getQuizById(params.id);

        if (!quiz) {
            return json({ error: "Quiz non trouvé" }, { status: 404 });
        }

        const result = participationService.calculateScore(quiz, answers);

        const participation = await participationService.createParticipation({
            quizId: quiz._id,
            username,
            userAnswers: answers,
            score: result.score,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions
        });

        return json({
            success: true,
            result: {
                score: result.score,
                correctAnswers: result.correctAnswers,
                totalQuestions: result.totalQuestions
            }
        });
    } catch (error) {
        console.error("Erreur lors de la soumission:", error);
        return json({ error: "Erreur serveur" }, { status: 500 });
    }
};

/**
 * @type {import("./$types").RequestHandler}
 */
export const DELETE = async ({ params, cookies }) => {
    try {
        const sessionId = cookies.get('sessionId');
        if (!sessionId) {
            return json({ error: "Non authentifié" }, { status: 401 });
        }

        const user = await userService.getFromJWT(sessionId);
        if (!user) {
            return json({ error: "Session invalide" }, { status: 401 });
        }

        const quiz = await quizService.getQuizById(params.id);
        if (!quiz) {
            return json({ error: "Quiz non trouvé" }, { status: 404 });
        }

        await participationService.deleteParticipationsByQuizId(params.id);

        const deleted = await quizService.deleteQuiz(params.id, user._id.toString());

        if (!deleted) {
            return json({ error: "Erreur lors de la suppression ou quiz non trouvé" }, { status: 404 });
        }

        return json({ success: true, message: "Quiz et participations supprimés avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du quiz:", error);
        return json({ error: "Erreur serveur" }, { status: 500 });
    }
};
