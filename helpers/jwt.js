const expressJwt = require('express-jwt');


function authJwt() {
    const secret = process.env.SECRET;
    const api = process.env.API_URL;

    return expressJwt({
        secret,
        algorithms: ['HS256'],

        isRevoked: isRevoked
    })
        // Public Routes: (NOT Authenticated Routes) and expect these are Authenticated Routes
        .unless({
            path: [
                // 'OPTIONS' : Another Request             
                {
                    url: /\/public\/upload(.*)/, methods: ['GET', 'OPTIONS']
                },
                {
                    // url: `${api}/products/all`, methods: ['GET', 'OPTIONS']
                    url: /\api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']
                },
                {
                    url: /\api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']

                },
                {
                    url: /\api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS']

                },
                `${api}/users/login`,
                `${api}/users/register`,

            ]
        });
}

// User Role: Admin
async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        return done(null, true);
    }
    return done();

}

module.exports = authJwt;