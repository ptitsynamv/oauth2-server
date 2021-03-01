const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *   AuthorizationCode:
 *     required:
 *       - code
 *       - clientId
 *       - redirectUri
 *       - userId
 *       - userName
 *     properties:
 *       code:
 *         type: string
 *       clientId:
 *         type: string
 *       redirectUri:
 *         type: string
 *       userId:
 *         type: string
 *       userName:
 *         type: string
 */

const authorizationCodeSchema = new Schema({
    code: {
        type: String,
        required: true,
    },
    clientId: {
        type: String,
        required: true,
    },
    redirectUri: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('oauth2-authorization-codes', authorizationCodeSchema);
