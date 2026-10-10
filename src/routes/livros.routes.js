const { Router } = require('express');
const { asyncHandler } = require('../middlewares/errorHandler');
const controller = require('../controllers/livros.controller');
const auth = require('../middlewares/auth');


const router = Router();

router.get('/', auth, asyncHandler(controller.listar));
router.post('/', auth, asyncHandler(controller.criar));
router.put('/:id', auth, asyncHandler(controller.editar));
router.delete('/:id', auth, asyncHandler(controller.deletar));


module.exports = router;
