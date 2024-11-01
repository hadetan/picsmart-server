# PicsMart Project Notes (BackEnd)

## Installation

1. First I initialized the project with - `npm init`

2. Then I installed few packages -

```bash
npm i dotenv nodemon express mongodb mongoose
```

**Now I have created the exact file structure as I had in the MongoDB & Mongoose class.**

## Authentication

We will first learn how to create an authentication program. Every Project now a days requires an authentication process, so think this project as a very separate entity.

### Morgan

Let's install a middleware package called `morgan` -

```bash
npm i morgan
```

```javascript
//Inside route index.js
app.use(morgan("common"));
```

This middleware helps us to log in our terminal about which API we have hit.

### Bcrypt

To hash (encrypt) the users password while they are signing up, we will use `bcrypt` package -

```bash
npm i bcrypt
```

While signing up -

```javascript
//Inside auth.controller.js
const bcrypt = require('bcrypt');
//Now we will encrypt the users password
const hashedPassword = await bcrypt.hash(password, 10);
//Then return with hashed password
const user = await User.create({
    email,
    password: hashedPassword,
});
```

While logging in -

```javascript
//Inside auth.controller.js
const bcrypt = require('bcrypt');
//Now we will encrypt the users password
const matchedPassword = await bcrypt.compare(password, user.password);
//Then return with hashed password
return res.json({
    email,
    password: hashedPassword,
});
```

### JSON Web Token

Now let us understand about something called as `JWT` (Json Web Token) -
<!-- This package helps us to create a token which we will save in frontend, so that our users will not have to login again and again for a certain time. This token will allow us to track if the login or signup was safe and secure. How would it help us to make the authentication safe and secure? We could save the login or signup sessions while saving their `userID` in the cache memory, and anyone who copied and pasted the `userID` string, will be able to login without any email and password process, and using the JWT token we will be able to identify if this user was logged in from the proper way and not from using a cheat or criminal way. Because `JWT` package creates a very long encrypted string which only the backend will be able to decrypt and authorize the session. -->

JSON Web Token (JWT) is an open standard based on JSON to create access tokens that allow the use of application or API resources. This token will incorporate the information of the user who needs the server to identify it as well as additional information that may be useful (roles, permissions etc.)

It may also have a `validity period`. Once this validity period has elapsed, the server will no longer allow access to resources with this token. In this step, the user will have to get a new access token by reauthentication or with some additional method: `refresh token`.

Whenever a user logs in, it is a responsbility for backend to generate a token which is called `access token`. If we put expiry time to this `access token`, then even if the session is hacked, they will not be able to stay logged in for long.

Let's install this package -

```bash
npm i jsonwebtoken
```

```javascript
//import jsonwebtoken as `jwt`
const jwt = require('jsonwebtoken');
//First create a function inside auth.controller.js
const generateAccessToken = (data) => {
    try {
        const token = jwt.sign(data, 'MySecretKey', {
        expiresIn: '60s',
    });
    console.log(token);
    return token;
    } catch (err) {
    console.log(err);
    }
};
```

Now go back to loginController function and after matching the password do this -

```javascript
const accessToken = generateAccessToken({
    _id: user._id,
    email: user.email,
});
//Then remove the previous success return with this
return res.json({
    accessToken: accessToken,
});
```

Now we will create post.controller.js and post.route.js so that we can create a functionality where if user is not logged in then they will not be able to access posts from our app.

Now we will create a middleware and apply it to the post.route.js file -

```javascript
//requireUser.js
module.exports = async (req, res, next) => {
    console.log('this is a middleware');
    next(); 
}
//post.route.js
router.get('/all', requireUser, getAllPostsController);
```

When I will hit this api `/v1/post/all` then this middleware will just log the message

```bash
this is a middleware
```

There are two important things that we can find inside of the request object, one is `req.body` from where we access our json sent data, one is `req.params`, inside the params we can catch the parameters sent by user and then evaluate it in a way we want to. What is parameters? When you do `/api/get/user/123` (this is just for an example), the `123` is something which a user may be sending data through params. For example it could be the id of the user they are visiting, so using `req.params` we can track which user they are visiting and load data of that user. We can get many more helps from params depending on the servers configuration. Lastly there's `req.headers` inside which we can varifythe API's. Inside the headers we will send the `accessToken`, inside the authorization header we will receive the access token like this: `Bearer #(the access token string)`. Bearer is a protocol that allows every types of API to work similiar to each other, no matter if its created in nodeJS or spring boot, all of these API's will follow the Bearer protocol.

To generate a very long and safe cryptography string, we have a function in nodeJS called crypto which can be used in nodeJS repl console like this -

```bash
require('crypto').randomBytes(64).toString('hex');
# Returned - '17d0917b43dc12c45ff8e420ffdfffe66e976d1b3816198b3c7fed47ace3de9143159baa0c22744fb27605d104c729e771c84ba3b724e6c133aadf80631a98a6'
```

We will have two types of tokens in order to create a more secure authentication while maintaining User Experience.

1. Access token: It contains all the information the server needs to know if the user / device can access the resource you are requesting or not. They have usually expired tokens with a short validity period. For example 15 minutes or so.

2. Refresh token: The refresh token is used to generate a new access token. Typically, if the access token has an expiration date, once it expires, the user would have to authenticate again to obtain an access token. With refresh token, this step can be skipped and with a request to the API get a new access token that allows the user to continue accessing the application resources.

We have already created `access token` which has a validy of 15 minutes, now lets create a refresh token -

```javascript
//auth.controller.js
const refreshAccessTokenController = async (req, res) => {
const { refreshToken } = req.body;

if (!refreshToken) {
    return res.status(401).send('Refresh token is required');
}

try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_PRIVATE_KEY);

    const _id = decoded._id;
    const newAccessToken = generateAccessToken({ _id });

    return res.status(201).json({
        newAccessToken,
    });
} catch (err) {
    console.log(err);
    return res.status(401).send('Inval_ refresh token');
}
};
```

What this controller will do is, it will check if the access token as expired or not, if its expired then it will generate new access token and return it to the frontend. The frontend will silently call this `refreshAccessTokenController` everytime the access token has expired. The access token will be saved inside local storage in frontend, and refresh token will be saved in cookie using a very secure package `httpOnly`, the httpOnly can never be accessed through JavaScript, that is why we are saving access token inside local storage so we can know when its getting expired.

### Cookie Parser

`cookie-parser` is a package that helps us to send some things inside HTTP header cookies. The `cookie-parser` extracts the cookie data from the HTTP request and converts it into a usable format that can be accessed by the server-side code. It parses the cookie data to extract individual values such as the cookie name, value and expiration date.

Lets install this package -

```bash
npm i cookie-parser
```

This package is used as a middleware, and to use it, we can follow the code example -

```javascript
//route index.js
const cookieParser = require('cookie-parser');
app.use(cookieParser());
```

Before, we were sending refresh token in our response of login controller, now we will not send it like that. We will now send it like this -

```javascript
//auth.controller.js loginController
//We will send the refresh token inside res.cookie(), and it takes these in arguments
res.cookie(name, value, {
    options: options
});

//To use it -
res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: true,
});
```

After setting the `httpOnly: true` mark, this cookie will not be accessible by frontend, it can only be accessed through HTTP request only. By doing this the security of our authentication increases drastically. The `secure: true` will make it accessible for HTTPS, it will be helpful when the server will be hosted and will turn from HTTP to HTTPS.

### Utils

Currently if you see, our response is recieved as a plain object. But now we will not send it like that, we will send the status codes and error messages and results inside the object as response. Why do we need to do it? Because frontend cannot know if the error occured because of server or from the connectivity. So we will send it as I mentioned so that we can handle errors in frontend in better way.

Lets create a folder called `utils` inside `src`. Inside this folder create `responseWrapper.js` file, and follow the code -

```javascript
//We will map our response using these two functions
const success = (statusCode, result) => {
    return {
        status: 'ok',
        statusCode,
        result,
    };
};

const error = (statusCode, message) => {
    return {
        status: 'error',
        statusCode,
        message,
};
};

module.exports = {
    success,
    error,
};
```

Till now we were sending response like `res.status(statusCode).send('error message')`, but now we will send the response like this - `res.send(error(statusCode, 'error message'));`

Now we can move to frontend part.

### CORS

CORS (Cross Origin Resource Sharing) is a package that allows two different http's to talk with each other, else the browser does not allow it to happen. We will have to specify that `this` is our frontend URL to whom we want to listen and talk to. Else when we will hit our backend API's from frontend, it will be blocked by CORS policy. To prevent this blockage we will use this package called CORS.

To install -

```bash
npm i cors
```

As I said, we will have to specify that `this` is going to be our URL and allow it to talk with our backend API's, if we do not specify it, for example when we just do this -

```javascript
//Root index.js
app.use(cors());
```

Then this method is going to allow anyone and everyone to access our backend, which is not okay at all. That is why we will have to specify only our trusted URL for allowing.

```javascript
//Root index.js
app.use(cors({
    origin: 'http://example.com' //Our frontend URL
}))
```
