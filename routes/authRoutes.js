import express from 'express';
import { linkProvider, login, setPassword } from '../controllers/authController.js';
import passport from 'passport';
import { generateToken } from '../utils/jwt.js';
import authMiddleware from '../middleware/auth.js';
import { handleSocialLogin } from '../services/authService.js';
const router = express.Router();

router.post('/login', login);
router.post('/link/:provider', linkProvider);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const profile = req.user.profile; // from passport strategy
    const user = await handleSocialLogin({
      provider: 'google',
      providerId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      avatar: profile.photos[0]?.value
    });
    const token = generateToken(user._id, user.email);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// router.use(authMiddleware);

router.post('/set-password', setPassword);

export default router;