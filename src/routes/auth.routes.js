const { Router } = require('express');
const { asyncHandler } = require('../middlewares/errorHandler');
const controller = require('../controllers/auth.controller');

const router = Router();

router.post('/cadastro', asyncHandler(controller.cadastro));
router.post('/login', asyncHandler(controller.login));

module.exports = router;
