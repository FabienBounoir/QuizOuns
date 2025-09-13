import { db } from "$lib/server/db.server.js";
import { ObjectId } from "mongodb";

/**
 * Service to manage quizzes
 */
class QuizService {
    constructor() {
        this.collection = db.collection("quiz");
    }

    async createQuiz(quizData, userId) {
        const quiz = {
            ...quizData,
            createdBy: new ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await this.collection.insertOne(quiz);
        return { ...quiz, _id: result.insertedId };
    }

    async getUserQuizzes(userId) {
        return await this.collection
            .find({ createdBy: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();
    }

    async getQuizById(quizId) {
        return await this.collection.findOne({ _id: new ObjectId(quizId) });
    }

    /**
     * Update a quiz with filtered data to prevent unwanted field updates
     */
    async updateQuiz(quizId, updateData, userId) {
        const filteredData = {
            ...(updateData.title && { title: updateData.title }),
            ...(updateData.description && { description: updateData.description }),
            ...(updateData.questions && { questions: updateData.questions }),
            ...(updateData.category && { category: updateData.category }),
            ...(updateData.difficulty && { difficulty: updateData.difficulty }),
            ...(updateData.isPublic !== undefined && { isPublic: updateData.isPublic })
        };

        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(quizId), createdBy: new ObjectId(userId) },
            {
                $set: {
                    ...filteredData,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        return result?.value || null;
    }

    async deleteQuiz(quizId, userId) {
        const result = await this.collection.deleteOne({
            _id: new ObjectId(quizId),
            createdBy: new ObjectId(userId)
        });

        return result.deletedCount > 0;
    }

    async getAllPublicQuizzes() {
        return await this.collection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
    }
}

export const quizService = new QuizService();
