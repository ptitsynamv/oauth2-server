const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *   AccessToken:
 *     required:
 *       - token
 *       - userId
 *       - clientId
 *     properties:
 *       token:
 *         type: string
 *       userId:
 *         type: string
 *       clientId:
 *         type: string
 */

const accessTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    clientId: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('accessTokens', accessTokenSchema);