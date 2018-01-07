const multer = require('multer');
const passport = require('passport');
const passportService = require('./services/passport');
const Authentication = require('./controllers/authentication');

const Bookclub = require('./controllers/bookclub');
const config = require('./config');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const requireSignin = passport.authenticate('local', {session: false});
const secret = config.shared_secret;
const bodyParser = require('body-parser');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    console.log("file type:", file.mimetype);
    cb(null, Date.now() + '.jpg') //Appending .jpg
  }
})

var upload = multer({ storage: storage });
var jsonParser = bodyParser.json();

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://jmillie.auth0.com/.well-known/jwks.json"
    }),
    audience: 'https://pacific-scrubland-65914.herokuapp.com/nightlife',
    issuer: "https://jmillie.auth0.com/",
    algorithms: ['RS256']
});

module.exports = function(app) {
  app.get('/', function (req, res){
    res.status(200).send('Hello!');
  });
  app.get('/authorized', jwtCheck, function (req, res){
    res.status(200).send('Hello authorized user!');
  });
  app.get('/bookclub/getallbooks', Bookclub.getAllBooks);
  app.get('/bookclub/getpicture', Bookclub.getPicture);
  app.get('/bookclub/getallbooksbyuser', Bookclub.getAllBooksByUser);
  app.get('/bookclub/getoffersbyuser', Bookclub.getOffersByUser);
  app.get('/bookclub/getrequestsbyuser', Bookclub.getRequestsByUser);

  app.post('/bookclub/trade', Bookclub.initTrade);
  app.post('/bookclub/deletebook', jsonParser, Bookclub.deleteBook);
  app.post('/bookclub/inittrade', jsonParser, Bookclub.initTrade);
  app.post('/bookclub/finalizebooktrade', jsonParser, Bookclub.finalizeBookTrade);
  app.post('/bookclub/addbook', upload.single('file'), Bookclub.addBook);
  //app.post('/bookclub/addbook', upload.single('file'), Bookclub.addBook);
}
