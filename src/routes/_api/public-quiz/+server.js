import { quizService } from "$lib/server/services/quiz.service.js";
import { participationService } from "$lib/server/services/participation.service.js";
import { json } from "@sveltejs/kit";

/**
 * @type {import("./$types").RequestHandler}
 */
export const GET = async ({ url }) => {
    try {
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '12', 10);
        const searchQuery = url.searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const allQuizzes = await quizService.getAllPublicQuizzes();

        let publicQuizzes = allQuizzes.filter(quiz => !quiz.isPrivate);

        if (searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase().trim();
            publicQuizzes = publicQuizzes.filter(quiz => {
                const titleMatch = quiz.title && quiz.title.toLowerCase().includes(searchTerm);
                const descriptionMatch = quiz.description && quiz.description.toLowerCase().includes(searchTerm);
                return titleMatch || descriptionMatch;
            });
        }

        const totalQuizzes = publicQuizzes.length;
        const paginatedQuizzes = publicQuizzes.slice(skip, skip + limit);
        const publicQuizzesWithStats = await Promise.all(
            paginatedQuizzes.map(async (quiz) => {
                const participations = await participationService.getQuizParticipations(quiz._id.toString());

                const validParticipations = participations.filter(participation => {
                    const answers = participation.userAnswers || participation.answers;
                    return answers && Array.isArray(answers) && answers.length > 0;
                });

                return {
                    _id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    questionCount: quiz.questions?.length || 0,
                    createdAt: quiz.createdAt,
                    participationCount: validParticipations.length
                };
            })
        );

        return json({
            quizzes: publicQuizzesWithStats,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalQuizzes / limit),
                totalQuizzes,
                hasNextPage: page < Math.ceil(totalQuizzes / limit),
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des quiz publics:", error);
        return json({ error: "Erreur serveur" }, { status: 500 });
    }
};