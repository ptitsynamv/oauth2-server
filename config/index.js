let index;

if (process.env.NODE_ENV === 'production') {
    index = require('./keys.prod')
} else {
    index = require('./keys.dev')
}

module.exports = {
    ...index,
    security: {
        tokenLife: 3600,
    },
};