import { db } from "$lib/server/db.server.js";
import { ObjectId } from "mongodb";

/**
 * Service to manage quizzes
 */
class QuizService {
    constructor() {
        this.collection = db.collection("quiz");
    }

    /**
     * Créer un nouveau quiz
     * @param {Object} quizData - Les données du quiz
     * @param {string} userId - L'ID de l'utilisateur créateur
     * @returns {Promise<Object>} Le quiz créé
     */
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

    /**
     * Récupérer les quiz d'un utilisateur
     * @param {string} userId - L'ID de l'utilisateur
     * @returns {Promise<Array<Object>>} La liste des quiz
     */
    async getUserQuizzes(userId) {
        return await this.collection
            .find({ createdBy: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();
    }

    /**
     * Récupérer un quiz par son ID
     * @param {string} quizId - L'ID du quiz
     * @returns {Promise<Object|null>} Le quiz trouvé ou null
     */
    async getQuizById(quizId) {
        return await this.collection.findOne({ _id: new ObjectId(quizId) });
    }

    /**
     * Mettre à jour un quiz
     * @param {string} quizId - L'ID du quiz
     * @param {any} updateData - Les nouvelles données
     * @param {string} userId - L'ID de l'utilisateur (pour vérifier les permissions)
     * @returns {Promise<Object|null>} Le quiz mis à jour ou null
     */
    async updateQuiz(quizId, updateData, userId) {
        const filteredData = {
            ...(updateData.title && { title: updateData.title }),
            ...(updateData.description && { description: updateData.description }),
            ...(updateData.questions && { questions: updateData.questions }),
            ...(updateData.category && { category: updateData.category }),
            ...(updateData.difficulty && { difficulty: updateData.difficulty }),
            ...(updateData.isPrivate !== undefined && { isPrivate: updateData.isPrivate })
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

    /**
     * Supprimer un quiz
     * @param {string} quizId - L'ID du quiz
     * @param {string} userId - L'ID de l'utilisateur (pour vérifier les permissions)
     * @returns {Promise<boolean>} True si supprimé, false sinon
     */
    async deleteQuiz(quizId, userId) {
        const result = await this.collection.deleteOne({
            _id: new ObjectId(quizId),
            createdBy: new ObjectId(userId)
        });

        return result.deletedCount > 0;
    }

    /**
     * Récupérer tous les quiz publics
     * @returns {Promise<Array<Object>>} La liste de tous les quiz
     */
    async getAllPublicQuizzes() {
        return await this.collection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
    }
}

export const quizService = new QuizService();
