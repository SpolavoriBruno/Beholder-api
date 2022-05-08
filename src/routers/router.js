const router = require('express').Router();

const authMiddleware = require('../middlewares/authMiddleware')
const { doLogin, doLogout } = require('../controllers/authController')

router.post('/login', doLogin)
router.post('/logout', authMiddleware, doLogout)

router.use('/settings', authMiddleware, require('./settingsRouter'))
router.use('/symbols', authMiddleware, require('./symbolsRouter'))
router.use('/exchange', authMiddleware, require('./exchangeRouter'))
router.use('/orders', authMiddleware, require('./ordersRouter'))
router.use('/monitors', authMiddleware, require('./monitorRouter'))
router.use('/automations', authMiddleware, require('./automationRouter'))
router.use('/beholder', authMiddleware, require('./beholderRouter'))

module.exports = router;
