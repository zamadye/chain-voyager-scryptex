
import { Router } from 'express';
import { chainController } from '@/controllers/chainController';

const router = Router();

/**
 * @swagger
 * /chains:
 *   get:
 *     summary: Get all supported chains
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of supported chains
 */
router.get('/', chainController.getAllChains);

/**
 * @swagger
 * /chains/{chainId}:
 *   get:
 *     summary: Get specific chain details
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chain details
 */
router.get('/:chainId', chainController.getChainById);

/**
 * @swagger
 * /chains/{chainId}/status:
 *   get:
 *     summary: Get chain status
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chain status information
 */
router.get('/:chainId/status', chainController.getChainStatus);

/**
 * @swagger
 * /chains/{chainId}/gas-price:
 *   get:
 *     summary: Get current gas price for chain
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current gas price
 */
router.get('/:chainId/gas-price', chainController.getGasPrice);

/**
 * @swagger
 * /chains/user-chains:
 *   get:
 *     summary: Get user's selected chains
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's chain preferences
 */
router.get('/user-chains', chainController.getUserChains);

/**
 * @swagger
 * /chains/{chainId}/user-preference:
 *   put:
 *     summary: Update user chain preference
 *     tags: [Chains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *               priorityOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: Preference updated successfully
 */
router.put('/:chainId/user-preference', chainController.updateUserChainPreference);

export default router;
