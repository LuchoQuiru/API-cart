const { auth } = require('express-oauth2-jwt-bearer');
// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
    audience: 'http://localhost:3000',
    issuerBaseURL: `https://dev-yx6fbhaw.us.auth0.com/`,
});

module.exports = checkJwt