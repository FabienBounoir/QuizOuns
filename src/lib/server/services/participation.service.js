import { db } from "$lib/server/db.server.js";
import { ObjectId } from "mongodb";

/**
 * Service to manage quiz participations
 */
class ParticipationService {
    constructor() {
        this.collection = db.collection("participations");
    }

    /**
     * Save a quiz participation
     */
    async createParticipation(participationData) {
        const participation = {
            ...participationData,
            submittedAt: new Date()
        };

        const result = await this.collection.insertOne(participation);
        return { ...participation, _id: result.insertedId };
    }

    /**
     * Get participations for a quiz
     */
    async getQuizParticipations(quizId) {
        return await this.collection
            .find({ quizId: new ObjectId(quizId) })
            .sort({ submittedAt: -1 })
            .toArray();
    }

    /**
     * Calculate score for a participation
     * Complex scoring algorithm handling both single and multiple choice questions
     */
    calculateScore(quiz, userAnswers) {
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;
        const details = [];

        // Validate user answers input
        if (!userAnswers || !Array.isArray(userAnswers)) {
            return {
                score: 0,
                correctAnswers: 0,
                totalQuestions,
                details: quiz.questions.map((_, index) => ({
                    questionIndex: index,
                    userAnswer: null,
                    correctOptions: [],
                    isCorrect: false
                }))
            };
        }

        quiz.questions.forEach((question, questionIndex) => {
            const userAnswer = userAnswers[questionIndex];
            let isCorrect = false;

            if (question.type === 'single') {
                const selectedOptionIndex = userAnswer;
                if (selectedOptionIndex !== null && selectedOptionIndex !== undefined) {
                    const selectedOption = question.options[selectedOptionIndex];
                    isCorrect = selectedOption && selectedOption.isCorrect;
                }
            } else {
                // Multiple choice: all correct options must be selected, no incorrect ones
                const userSelectedIndices = Array.isArray(userAnswer) ? userAnswer : [];
                const correctIndices = question.options
                    .map((opt, idx) => opt.isCorrect ? idx : null)
                    .filter(idx => idx !== null);

                isCorrect = userSelectedIndices.length === correctIndices.length &&
                    userSelectedIndices.every(idx => correctIndices.includes(idx)) &&
                    correctIndices.every(idx => userSelectedIndices.includes(idx));
            }

            if (isCorrect) {
                correctAnswers++;
            }

            details.push({
                questionIndex,
                userAnswer,
                correctOptions: question.options.filter(opt => opt.isCorrect).map(opt => opt.text),
                isCorrect
            });
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);

        return {
            score,
            correctAnswers,
            totalQuestions,
            details
        };
    }

    /**
     * Delete all participations for a quiz
     */
    async deleteParticipationsByQuizId(quizId) {
        const result = await this.collection.deleteMany({
            quizId: new ObjectId(quizId)
        });
        return result.deletedCount;
    }
}

export const participationService = new ParticipationService();
