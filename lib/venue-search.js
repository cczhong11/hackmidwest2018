const rp = require('request-promise');

module.exports = {
    venueSearch: function (searchString, cb) {
        rp({
            uri: 'https://api.foursquare.com/v2/venues/explore',
            qs: {
                client_id: '0VQEVMWM1LTDRR5WWI2EJD1JKS0PTYXNVA51GLMGNIQ41VEZ',
                client_secret: 'UO4H2X2P0MDXE31PRVCWNH4XH0FRWMFIAGH0B2WQXLW4YOBW',
                ll: '39.137278,-94.579900',
                //near: "Kansas City, MO",
                query: 'coffee',
                v: '20180721',
                limit: 1
            },
            json: true
        }).then((data) => {
            console.log(data);
            cb(data);
        }).catch((err) => {

        });
    }
};