import { quizService } from "$lib/server/services/quiz.service.js";
import { participationService } from "$lib/server/services/participation.service.js";
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

        // Récupérer l'utilisateur depuis le JWT
        const user = await userService.getFromJWT(sessionId);
        if (!user || user._id === "-1") {
            return json({ error: "Utilisateur non trouvé" }, { status: 401 });
        }

        const quiz = await quizService.getQuizById(params.id);

        if (!quiz) {
            return json({ error: "Quiz non trouvé" }, { status: 404 });
        }

        // Vérifier que l'utilisateur est le propriétaire du quiz
        if (quiz.createdBy.toString() !== user._id.toString()) {
            return json({ error: "Non autorisé - Seul le créateur peut voir les statistiques" }, { status: 403 });
        }

        const allParticipations = await participationService.getQuizParticipations(params.id);

        if (allParticipations.length > 0) {
            console.log('Sample participation structure:', {
                hasAnswers: !!allParticipations[0].answers,
                userAnswers: allParticipations[0].userAnswers,
                hasUserAnswers: !!allParticipations[0].userAnswers,
                isArray: Array.isArray(allParticipations[0].userAnswers),
                length: allParticipations[0].userAnswers?.length
            });
        }

        // Filter valid participations and normalize data structure for compatibility
        const participations = allParticipations.filter(participation => {
            const answers = participation.userAnswers || participation.answers;
            return answers &&
                Array.isArray(answers) &&
                answers.length > 0;
        }).map(participation => {
            if (!participation.userAnswers && participation.answers) {
                participation.userAnswers = participation.answers;
            }
            return participation;
        });

        console.log(`Valid participations after filtering: ${participations.length}`);        // Calculer les statistiques globales
        const stats = {
            quiz: {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                totalQuestions: quiz.questions.length,
                createdAt: quiz.createdAt
            },
            global: {
                totalParticipations: participations.length,
                averageScore: 0,
                bestScore: 0,
                worstScore: participations.length > 0 ? 100 : 0,
                completionRate: 0
            },
            participations: [],
            questionStats: []
        };

        if (participations.length > 0) {
            let totalScore = 0;
            let bestScore = 0;
            let worstScore = 100;

            const participationDetails = participations.map(participation => {
                const result = participationService.calculateScore(quiz, participation.userAnswers);

                totalScore += result.score;
                bestScore = Math.max(bestScore, result.score);
                worstScore = Math.min(worstScore, result.score);

                return {
                    id: participation._id,
                    username: participation.username,
                    score: result.score,
                    correctAnswers: result.correctAnswers,
                    totalQuestions: result.totalQuestions,
                    submittedAt: participation.submittedAt,
                    details: result.details
                };
            });

            stats.global.averageScore = Math.round(totalScore / participations.length);
            stats.global.bestScore = bestScore;
            stats.global.worstScore = worstScore;
            stats.global.completionRate = 100;
            stats.participations = participationDetails;

            const questionStats = quiz.questions.map((question, questionIndex) => {
                let correctCount = 0;
                const answerDistribution = {};

                participationDetails.forEach(participation => {
                    const questionDetail = participation.details[questionIndex];
                    if (questionDetail && questionDetail.isCorrect) {
                        correctCount++;
                    }

                    const userAnswer = questionDetail?.userAnswer;
                    if (userAnswer !== null && userAnswer !== undefined) {
                        if (question.type === 'single') {
                            const optionText = question.options[userAnswer]?.text || 'Réponse invalide';
                            answerDistribution[optionText] = (answerDistribution[optionText] || 0) + 1;
                        } else {
                            if (Array.isArray(userAnswer)) {
                                userAnswer.forEach(answerIndex => {
                                    const optionText = question.options[answerIndex]?.text || 'Réponse invalide';
                                    answerDistribution[optionText] = (answerDistribution[optionText] || 0) + 1;
                                });
                            }
                        }
                    }
                });

                return {
                    questionIndex,
                    questionText: question.text,
                    questionType: question.type,
                    correctAnswers: correctCount,
                    totalAttempts: participations.length,
                    successRate: participations.length > 0 ? Math.round((correctCount / participations.length) * 100) : 0,
                    answerDistribution,
                    correctOptions: question.options.filter(opt => opt.isCorrect).map(opt => opt.text)
                };
            });

            stats.questionStats = questionStats;
        }

        return json(stats);
    } catch (error) {
        console.error("Error fetching statistics:", error);
        return json({ error: "Server error" }, { status: 500 });
    }
};
