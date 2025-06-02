
import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateBody, validateParams } from '../middleware/validation';
import {
  challengeSchema,
  verifySignatureSchema,
  refreshTokenSchema,
  updateProfileSchema,
  addWalletSchema,
  walletAddressParamSchema
} from '../validators/authValidators';

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         avatarUrl:
 *           type: string
 *           format: uri
 *         bio:
 *           type: string
 *         referralCode:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastLogin:
 *           type: string
 *           format: date-time
 * 
 *     Wallet:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         address:
 *           type: string
 *         type:
 *           type: string
 *           enum: [metamask, walletconnect, coinbase]
 *         chainId:
 *           type: number
 *         isPrimary:
 *           type: boolean
 *         nickname:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         expiresIn:
 *           type: number
 * 
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /auth/challenge:
 *   post:
 *     summary: Generate authentication challenge for wallet
 *     description: Generate a unique challenge message that must be signed by the wallet to authenticate
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 pattern: ^0x[a-fA-F0-9]{40}$
 *                 example: "0x742d35Cc6542Cb23C68b68b6B6Bb6B3e1234abcd"
 *     responses:
 *       200:
 *         description: Challenge generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenge:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     message:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/challenge', validateBody(challengeSchema), authController.generateChallenge);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify wallet signature and authenticate user
 *     description: Verify the signed challenge and return authentication tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *               - challenge
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 pattern: ^0x[a-fA-F0-9]{40}$
 *               signature:
 *                 type: string
 *               challenge:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify', validateBody(verifySignatureSchema), authController.verifySignature);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional if provided in httpOnly cookie
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate the current session and tokens
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     wallets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Wallet'
 *                     stats:
 *                       type: object
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
router.put('/profile', authMiddleware, validateBody(updateProfileSchema), authController.updateProfile);

/**
 * @swagger
 * /auth/wallets:
 *   get:
 *     summary: Get user's connected wallets
 *     description: Retrieve all wallets connected to the authenticated user's account
 *     tags: [Wallet Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Wallet'
 */
router.get('/wallets', authMiddleware, authController.getWallets);

/**
 * @swagger
 * /auth/wallets:
 *   post:
 *     summary: Add a new wallet to account
 *     description: Link a new wallet to the authenticated user's account
 *     tags: [Wallet Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - type
 *             properties:
 *               address:
 *                 type: string
 *                 pattern: ^0x[a-fA-F0-9]{40}$
 *               type:
 *                 type: string
 *                 enum: [metamask, walletconnect, coinbase]
 *               chainId:
 *                 type: number
 *               nickname:
 *                 type: string
 *                 maxLength: 50
 *     responses:
 *       201:
 *         description: Wallet linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       $ref: '#/components/schemas/Wallet'
 */
router.post('/wallets', authMiddleware, validateBody(addWalletSchema), authController.addWallet);

/**
 * @swagger
 * /auth/wallets/{walletAddress}:
 *   delete:
 *     summary: Remove wallet from account
 *     description: Unlink a wallet from the authenticated user's account
 *     tags: [Wallet Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^0x[a-fA-F0-9]{40}$
 *     responses:
 *       200:
 *         description: Wallet removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 */
router.delete('/wallets/:walletAddress', authMiddleware, validateParams(walletAddressParamSchema), authController.removeWallet);

/**
 * @swagger
 * /auth/wallets/{walletAddress}/primary:
 *   put:
 *     summary: Set wallet as primary
 *     description: Set the specified wallet as the primary wallet for the account
 *     tags: [Wallet Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^0x[a-fA-F0-9]{40}$
 *     responses:
 *       200:
 *         description: Primary wallet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 */
router.put('/wallets/:walletAddress/primary', authMiddleware, validateParams(walletAddressParamSchema), authController.setPrimaryWallet);

export default router;
