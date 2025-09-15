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
     * Récupérer les quiz d'un utilisateur avec pagination et recherche
     * @param {string} userId - L'ID de l'utilisateur
     * @param {Object} [options] - Options de pagination et recherche
     * @param {number} [options.page] - Numéro de page (défaut: 1)
     * @param {number} [options.limit] - Nombre d'éléments par page (défaut: 6)
     * @param {string} [options.search] - Terme de recherche (défaut: '')
     * @returns {Promise<Object|Array>} Résultat avec quizzes, total, page, totalPages ou tableau simple
     */
    async getUserQuizzes(userId, options) {
        const { page = 1, limit = 6, search = '' } = options || {};
        const skip = (page - 1) * limit;

        // Construire la requête de base
        let query = { createdBy: new ObjectId(userId) };

        // Ajouter la recherche si fournie
        if (search.trim()) {
            query = {
                ...query,
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Si pas de pagination demandée (pour compatibilité avec l'ancien code)
        if (!options) {
            return await this.collection
                .find(query)
                .sort({ createdAt: -1 })
                .toArray();
        }

        // Récupérer les quiz avec pagination
        const quizzes = await this.collection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        // Compter le total
        const total = await this.collection.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return {
            quizzes,
            total,
            page,
            totalPages,
            hasMore: page < totalPages
        };
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
