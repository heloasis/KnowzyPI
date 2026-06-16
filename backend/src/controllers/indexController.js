const path = require('path');

const indexController = {
    index: (req, res) => {
        res.sendFile(path.join(__dirname, '../../views/index/index.html'));
    }
};

module.exports = indexController;