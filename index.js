import express from 'express';
import pg from 'pg';
import bcrypt from 'bcrypt';
import session from 'express-session';
import passport from 'passport';
// import { Strategy } from 'passport-local';
// I decided not to use passport local strategy, because
// I wanted to use certain feature for user's convenience.
// The feature is: to fill input with entered email if auth failed.
// (e.g. fill login input if signup failed because already registered)
// With passport.authenticate(), using successRedirect and then callback
// (to render with entered email, if auth failed) didn't seem to work.
import GoogleStrategy from 'passport-google-oauth20';
import GitHubStrategy from 'passport-github2';
import DiscordStrategy from 'passport-discord';
import 'dotenv/config';

// init express and basic middlewares
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// init session and passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);
app.use(passport.session());

// init passport strategies
// passport.use(
//   'local',
//   new Strategy(async (username, password, cb) => {
//     try {
//       const result1 = await db.query(
//         'SELECT * FROM users WHERE username = ($1)',
//         [username]
//       );

//       if (result1.rowCount > 0) {
//         bcrypt.compare(password, result1.rows[0].password, (err, result2) => {
//           if (result2) {
//             // return
//              cb(null, result1.rows[0].id);
//           } else {
//             // return
//              cb(null, false);
//           }
//         });
//       } else {
//         // return
//          cb('User not found');
//       }
//     } catch (error) {
//       // return
//        cb(err);
//     }
//   })
// );

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/discord',
      scope: ['email'],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result1 = await db.query(
          'SELECT * FROM users WHERE username = $1',
          [profile.email]
        );

        if (result1.rowCount === 0) {
          const result2 = await db.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
            [profile.email, 'discord']
          );
          // return
          cb(null, result2.rows[0].id);
        } else {
          // return
          cb(null, result1.rows[0].id);
        }
      } catch (err) {
        // return
        cb(err);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/github',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result1 = await db.query(
          'SELECT * FROM users WHERE username = $1',
          [profile.emails[0].value]
        );

        if (result1.rowCount === 0) {
          const result2 = await db.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
            [profile.emails[0].value, 'github']
          );
          // return
          cb(null, result2.rows[0].id);
        } else {
          // return
          cb(null, result1.rows[0].id);
        }
      } catch (err) {
        // return
        cb(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google',
      scope: ['email'],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result1 = await db.query(
          'SELECT * FROM users WHERE username = $1',
          [profile.emails[0].value]
        );

        if (result1.rowCount === 0) {
          const result2 = await db.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
            [profile.emails[0].value, 'google']
          );
          // return
          cb(null, result2.rows[0].id);
        } else {
          // return
          cb(null, result1.rows[0].id);
        }
      } catch (err) {
        // return
        cb(err);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// init database
const db = new pg.Client({
  port: process.env.DB_PORT,
  host: process.env.HOST,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
});
db.connect();

// handle requests
app.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query('SELECT * FROM items WHERE user_id = ($1)', [
      req.user,
    ]);

    res.render('index', {
      items: result.rows,
    });
  } else {
    res.redirect('/auth');
  }
});

app.get('/auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('auth');
  }
});

app.post('/auth/local', async (req, res) => {
  try {
    const result1 = await db.query(
      'SELECT * FROM users WHERE username = ($1)',
      [req.body.username]
    );

    if (result1.rowCount > 0) {
      bcrypt.compare(
        req.body.password,
        result1.rows[0].password,
        (err, result2) => {
          if (result2) {
            req.login(result1.rows[0].id, (err) => {
              res.redirect('/');
            });
          } else {
            res.redirect('/auth');
          }
        }
      );
    } else {
      res.render('auth', {
        signUpUsername: req.body.username,
        message: 'Username does not exist. Please sign up.',
      });
    }
  } catch (error) {
    res.redirect('/auth');
  }
});

app.get(
  '/auth/google',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/auth',
  })
);

// using the above seems to work, instead of the following:
// app.get('/auth/google', passport.authenticate('google'));

// app.get(
//   '/auth/google/redirect',
//   passport.authenticate('google', {
//     successRedirect: '/',
//     failureRedirect: '/auth',
//   })
// );

app.get(
  '/auth/github',
  passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/auth',
  })
);

app.get(
  '/auth/discord',
  passport.authenticate('discord', {
    successRedirect: '/',
    failureRedirect: '/auth',
  })
);

app.post('/sign-up', async (req, res) => {
  try {
    const result1 = await db.query(
      'SELECT * FROM users WHERE username = ($1)',
      [req.body.username]
    );

    if (result1.rowCount !== 0) {
      res.render('auth', {
        logInUsername: req.body.username,
        message: 'Username exists. Please log in.',
      });
    } else {
      bcrypt.hash(
        req.body.password,
        Number(process.env.SALT_ROUNDS),
        async (err, hash) => {
          const result2 = await db.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
            [req.body.username, hash]
          );
          req.login(result2.rows[0].id, (err) => {
            res.redirect('/');
          });
        }
      );
    }
  } catch (error) {
    res.redirect('/auth');
  }
});

app.post('/add', async (req, res) => {
  if (req.isAuthenticated) {
    await db.query('INSERT INTO items (item, user_id) VALUES ($1, $2)', [
      req.body['add-item'],
      req.user,
    ]);
    res.redirect('/');
  } else {
    res.redirect('/auth');
  }
});

app.post('/edit', async (req, res) => {
  if (req.isAuthenticated) {
    await db.query(
      'UPDATE items SET item = $1 WHERE id = $2 AND user_id = $3',
      [req.body['edit-item'], req.body['edit-id'], req.user]
    );
    res.redirect('/');
  } else {
    res.redirect('/auth');
  }
});

app.post('/delete', async (req, res) => {
  if (req.isAuthenticated) {
    await db.query('DELETE FROM items WHERE id = $1 AND user_id = $2', [
      req.body['delete-id'],
      req.user,
    ]);
    res.redirect('/');
  } else {
    res.redirect('/auth');
  }
});

app.post('/sign-out', (req, res) => {
  req.logout((err) => {
    res.redirect('/auth');
  });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Serving on port ${process.env.SERVER_PORT}`);
});
