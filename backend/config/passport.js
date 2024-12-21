const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GitLabStrategy = require('passport-gitlab2').Strategy;
const AzureStrategy = require('passport-azure-ad').BearerStrategy;
const BitbucketStrategy = require('passport-bitbucket-oauth2').Strategy;
const User = require('../models/User');

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ providerId: profile.id, provider: 'github' });
      
      if (!user) {
        user = await User.create({
          username: profile.username,
          email: profile.emails[0].value,
          provider: 'github',
          providerId: profile.id,
          avatarUrl: profile.photos[0].value,
          accessToken,
          refreshToken
        });
      } else {
        user.lastLogin = new Date();
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// GitLab Strategy
passport.use(new GitLabStrategy({
    clientID: process.env.GITLAB_CLIENT_ID,
    clientSecret: process.env.GITLAB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/gitlab/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ providerId: profile.id, provider: 'gitlab' });
      
      if (!user) {
        user = await User.create({
          username: profile.username,
          email: profile.emails[0].value,
          provider: 'gitlab',
          providerId: profile.id,
          avatarUrl: profile.avatarUrl,
          accessToken,
          refreshToken
        });
      } else {
        user.lastLogin = new Date();
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Bitbucket Strategy
passport.use(new BitbucketStrategy({
    clientID: process.env.BITBUCKET_CLIENT_ID,
    clientSecret: process.env.BITBUCKET_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/bitbucket/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ providerId: profile.id, provider: 'bitbucket' });
      
      if (!user) {
        user = await User.create({
          username: profile.username,
          email: profile.emails[0].value,
          provider: 'bitbucket',
          providerId: profile.id,
          avatarUrl: profile._json.links.avatar.href,
          accessToken,
          refreshToken
        });
      } else {
        user.lastLogin = new Date();
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Azure AD Strategy
const azureOptions = {
  identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.AZURE_CLIENT_ID,
  validateIssuer: true,
  passReqToCallback: false,
  issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
  audience: process.env.AZURE_CLIENT_ID,
  loggingLevel: 'info'
};

passport.use(new AzureStrategy(azureOptions, async (token, done) => {
  try {
    let user = await User.findOne({ providerId: token.oid, provider: 'azure' });
    
    if (!user) {
      user = await User.create({
        username: token.preferred_username,
        email: token.preferred_username,
        provider: 'azure',
        providerId: token.oid,
        avatarUrl: null,
        accessToken: token.access_token
      });
    } else {
      user.lastLogin = new Date();
      user.accessToken = token.access_token;
      await user.save();
    }
    
    return done(null, user, token);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
