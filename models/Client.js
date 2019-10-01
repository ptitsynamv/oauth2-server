const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * definitions:
 *   Client:
 *     required:
 *       - name
 *       - clientId
 *       - clientSecret
 *       - isTrusted
 *     properties:
 *       name:
 *         type: string
 *       clientId:
 *         type: string
 *       clientSecret:
 *         type: string
 *       isTrusted:
 *         type: boolean
 */

const clientSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    clientId: {
        type: String,
        required: true,
        unique: true
    },
    clientSecret: {
        type: String,
        required: true,
        unique: true
    },
    isTrusted: {
        type: Boolean,
        required: true,
        default: false,
    }
});

module.exports = mongoose.model('clients', clientSchema);