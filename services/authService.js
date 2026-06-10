import User from '../models/User.js';

/**
 * Find or create user from external provider (Google/Apple)
 * Links to existing account if email matches.
 */
export const handleSocialLogin = async (providerData) => {
  const { provider, providerId, email, firstName, lastName, avatar } = providerData;

  // 1. Try to find user by provider ID (already linked)
  let user = await User.findOne({ [`${provider}Id`]: providerId });
  if (user) {
    // Ensure authProvider flag is true
    if (!user.authProviders[provider]) {
      user.authProviders[provider] = true;
      await user.save();
    }
    return user;
  }

  // 2. Try to find user by email (existing email/password or other provider)
  if (email) {
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      // Link this provider to existing account
      user[`${provider}Id`] = providerId;
      user.authProviders[provider] = true;
      await user.save();
      return user;
    }
  }

  // 3. No existing user – create new one
  user = await User.create({
    email: email || `${providerId}@${provider}.placeholder.com`, // fallback for Apple private relay
    [`${provider}Id`]: providerId,
    authProviders: { email: false, google: false, apple: false, [provider]: true },
    profile: { firstName, lastName, avatar },
    isActive: true
  });
  return user;
}