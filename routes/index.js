
const { Router } = require("express")
const router = Router();
const authRoute = require('./authRoute')


router.use('/', authRoute);


module.exports = router