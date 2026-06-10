import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // Update auth provider status if needed
        if (!user.authProviders.google) {
          user.authProviders.google = true;
          await user.save();
        }
        return done(null, user);
      }
      
      // Check if user exists with the same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.authProviders.google = true;
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      const newUser = await User.create({
        email: profile.emails[0].value,
        googleId: profile.id,
        authProviders: { email: false, google: true, apple: false },
        profile: {
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0]?.value
        },
        isActive: true
      });
      
      return done(null, newUser);
    } catch (err) {
      return done(err, null);
    }
  }
));