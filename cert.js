///
/// SSL certificate info
/// *may not need to be its own script, but nowhere else made sense
///

const fs = require('fs');

const cert = {
    key: fs.readFileSync('./dev/cert/key.pem'),
    cert: fs.readFileSync('./dev/cert/certificate.pem')
};

module.exports = cert;