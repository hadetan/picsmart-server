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
<!-- This package helps us to create a token which we will save in frontend, so that our users will not have to login again and again for a certain time. This token will allow us to track if the login or sign up was safe and secure. How would it help us to make the authentication safe and secure? We could save the login or sign up sessions while saving their `userID` in the cache memory, and anyone who copied and pasted the `userID` string, will be able to login without any email and password process, and using the JWT token we will be able to identify if this user was logged in from the proper way and not from using a cheat or criminal way. Because `JWT` package creates a very long encrypted string which only the backend will be able to decrypt and authorize the session. -->

JSON Web Token (JWT) is an open standard based on JSON to create access tokens that allow the use of application or API resources. This token will incorporate the information of the user who needs the server to identify it as well as additional information that may be useful (roles, permissions etc.)

It may also have a `validity period`. Once this validity period has elapsed, the server will no longer allow access to resources with this token. In this step, the user will have to get a new access token by reauthenticate or with some additional method: `refresh token`.

Whenever a user logs in, it is a responsibility for backend to generate a token which is called `access token`. If we put expiry time to this `access token`, then even if the session is hacked, they will not be able to stay logged in for long.

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

***Request and Response***

There are two important things that we can find inside of the request object, one is `req.body` from where we access our json sent data, one is `req.params`, inside the params we can catch the parameters sent by user and then evaluate it in a way we want to. What is parameters? When you do `/api/get/user/123` (this is just for an example), the `123` is something which a user may be sending data through params. For example it could be the id of the user they are visiting, so using `req.params` we can track which user they are visiting and load data of that user. We can get many more helps from params depending on the servers configuration. Lastly there's `req.headers` inside which we can verify the API's. Inside the headers we will send the `accessToken`, inside the authorization header we will receive the access token like this: `Bearer #(the access token string)`. Bearer is a protocol that allows every types of API to work similar to each other, no matter if its created in nodeJS or spring boot, all of these API's will follow the Bearer protocol.

To generate a very long and safe cryptography string, we have a function in nodeJS called crypto which can be used in nodeJS repl console like this -

```bash
require('crypto').randomBytes(64).toString('hex');
# Returned - '17d0917b43dc12c45ff8e420ffdfffe66e976d1b3816198b3c7fed47ace3de9143159baa0c22744fb27605d104c729e771c84ba3b724e6c133aadf80631a98a6'
```

***Types of tokens***

We will have two types of tokens in order to create a more secure authentication while maintaining User Experience.

1. Access token: It contains all the information the server needs to know if the user / device can access the resource you are requesting or not. They have usually expired tokens with a short validity period. For example 15 minutes or so.

2. Refresh token: The refresh token is used to generate a new access token. Typically, if the access token has an expiration date, once it expires, the user would have to authenticate again to obtain an access token. With refresh token, this step can be skipped and with a request to the API get a new access token that allows the user to continue accessing the application resources.

We have already created `access token` which has a validity of 15 minutes, now lets create a refresh token -

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
    return res.status(401).send('Invalid refresh token');
}
};
```

What this controller will do is, it will check if the access token as expired or not, if its expired then it will generate new access token and return it to the frontend. The frontend will silently call this `refreshAccessTokenController` every time the access token has expired. The access token will be saved inside local storage in frontend, and refresh token will be saved in cookie using a very secure package `httpOnly`, the httpOnly can never be accessed through JavaScript, that is why we are saving access token inside local storage so we can know when its getting expired.

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

Currently if you see, our response is received as a plain object. But now we will not send it like that, we will send the status codes and error messages and results inside the object as response. Why do we need to do it? Because frontend cannot know if the error occurred because of server or from the connectivity. So we will send it as I mentioned so that we can handle errors in frontend in better way.

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

***Using our middleware***

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

## Creating Features

We will add one more fields inside User.js with this -

```javascript
avatar: {
    publicId: String,
    url: String
}
```

Similarly we will create Post.js and create fields like these -

```javascript
const postSchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        image: {
            publicId: String,
            url: String,
        },
        caption: {
            type: String,
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
        ],
    },
    {
        timestamps: true,
    }
);
```

***Creating post controller***

We are good to go for creating a controller for post -

```javascript
const createPostController = async (req, res) => {
    const { caption } = req.body;
    const owner = req._id; //Being sent from our middleware.

    const user = await User.findById(owner);

    try {
        const post = await Post.create({
            owner, // In our Post.js schema we are expecting an owner id, so we will provide it like this.
            caption,
        });

        // In our User.js schema, we are expecting a post id, thats why we are pushing it to that array.
        user.posts.push(post._id);
        await user.save();

        return res.send(success(201, post));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};
```

***Removing all of the console logs***

I have swapped every `console.log(err)` in our project with `return res.send(error(500, err.message));` so that we can actually read the error which will be send from backend to frontend.

***Updating the User schema***

While signing up, if I respond back with the whole user which is created then we will see password inside of it as well, which is a very bad thing, in order to prevent that from happening we can disable password from being selected by default inside of our User.js schema like this -

```javascript
password: {
    type: String,
    required: true,
    select: false,
},
```

By default when we find a user, it will not send us the users password. Now comes a problem, while logging in, we are trying to match users password with the password user has given, and because we have selected password as false, we will not get it and so it will start giving us error. So for that we can edit our finding user logic a little like this -

```javascript
//Previously it was:
const user = await User.findOne({ email });

//But now we will select password manually:
const user = await User.findOne({ email }).select('+password');
```

***Creating like and dislike feature***

We will create new controller function inside of our post.controller.js file like this -

```javascript
const likeAndUnlikeController = async (req, res) => {
    const { postId } = req.body;
    const curUserId = req._id; // Current user who is going to like this post

    const post = await Post.findById(postId);

    if (!post) {
        return res.send(error(404, 'Post not found'));
    }

    // If user has already liked then we will dislike it, or if its disliked then we will like it.
    if (post.likes.includes(curUserId)) {
        try {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);

            await post.save();
            return res.send(success(200, 'Post disliked'));
        } catch (err) {
            return res.send(error(500, err.message));
        }
    } else {
        try {
            post.likes.push(curUserId);
            await post.save();

            return res.send(success(200, 'Post liked'));
        } catch (err) {
            return res.send(error(500, err.message));
        }
    }
};
```

Now with this single controller we can like and dislike the post depending on the situation.

***Creating followings and followers controller***

We will create a whole new set of controller for this feature, lets create `user.controller.js` inside of controllers folder and create this function -

```javascript
const followOrUnfollowController = async (req, res) => {
    const { userIdToFollow } = req.body;
    const curUserId = req._id;

    // Checking if the userIdToFollow and curUserId are both same? If they are then its not good because a user should not follow themselves
    if (userIdToFollow === curUserId) {
        return res.send(error(409, 'Cannot follow yourself'))
    }

    // Checking if the user has sent us the user id to follow
    if (!userIdToFollow) {
        return res.send(error(400, 'User id to follow is required'));
    }

    const userToFollow = await User.findById(userIdToFollow);

    // Finding if the user that they want to follow exists in our database.
    if (!userToFollow) {
        return res.send(error(404, 'User to follow not found'));
    }

    const curUser = await User.findById(curUserId);

    // Checking if the current user is actually a real user or a fake user.
    if (!curUser) {
        return res.send(error(404, 'Current user not found'));
    }

    if (curUser.followings.includes(userIdToFollow)) {
        // If the user is already present that they want to follow then make them unfollow.
        try {
            const followingIndex = curUser.followings.indexOf(userIdToFollow);
            curUser.followings.splice(followingIndex, 1);

            // When you unfollow a user, your followings decrement by one, and the user that you unfollowed gets their followers decremented by one as well. So we will have to handle that as well here.
            const followerIndex = userToFollow.followers.indexOf(curUserId);
            userToFollow.followers.splice(followerIndex, 1);

            // Save both users now
            await userToFollow.save();
            await curUser.save();

            return res.send(success(200, 'User unfollowed'));
        } catch (err) {
            return res.send(error(500, err.message));
        }
    } else {
        // If the user is not present that they want to follow then make them follow
        try {
            // When you follow a user, your followings increment by one, and the user that you followed gets their followers incremented by one as well. So we will have to handle that as well here.
            userToFollow.followers.push(curUserId);
            curUser.followings.push(userIdToFollow);

            // Save both users
            await userToFollow.save();
            await curUser.save();

            return res.send(success(200, 'User followed'));
        } catch (err) {
            return res.send(error(500, err.message));
        }
    }
};
```

***Creating get all posts of followings feature***

We will create a get controller which will automatically extract the current users id and then search through all of the users we follow and return the posts of the followings:

```javascript
const getPostsOfFollowing = async (req, res) => {
    try {
        const curUserId = req._id;

        const curUser = await User.findById(curUserId);

        // What this method will do is that, it will search the whole post schema and return all of the posts that has the owner of the followings the current user has. The $in operator helps us to search something that has the value `in` inside of it.
        // The `.find()` functions returns an array.
        const posts = await Post.find({
            owner: {
                $in: curUser.followings,
            },
        });
        
        return res.send(success(200, posts));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};
```

***Assignment***

Create a controller that can update the post, make sure that only owners can update their posts and no one else! The router will use `PUT` method for HTTP. You will get the current users id from the `req._id` which is coming from our middleware. Make sure that you put the requireUser.js middleware inside of your post update route. This controller will be created inside of the post.controller.js file. While testing the API, you will have to give the bearer token inside of your API testing software.

***Creating log out feature***

If you can see, while logging in or signing up we are setting the jwt refresh token inside of users cookies, and in frontend the access token is being saved inside of the local storage. We can not do anything for the local storage properties but we can perform actions on the refresh token that is saved in cookies. The responsibility for deleting the local storage access token will be frontend's, and the responsibility for deleting the refresh token of cookies will be backend's.

In order to log the user out, means delete the cookie from the user, we have a function called `clearCookie()` which asks the name of the cookie and the same configuration that we set while setting the cookie like this -

```javascript
const logoutController = async (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        });

        return res.send(success(200, 'User logged out'));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};
```

***Creating delete post feature***

If we want to delete a post then we will have to delete the post from the post schema and from user schemas posts field, because if you remember we are saving the posts inside of the user schema as well.

```javascript
const deletePostController = async (req, res) => {
    try {
        const { postId } = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.send(error(404, 'Post not found'));
        }

        if (post.owner.toString() !== curUserId) {
            return res.send(error(403, 'Only owners can delete their posts'));
        }

        const user = await User.findById(curUserId);

        // Deleting the post from the users posts array
        const index = user.posts.indexOf(postId);
        user.posts.splice(index, 1);

        await user.save();
        // Deleting the post from the Post schema
        await post.deleteOne();

        return res.send(success(200, 'Post deleted successfully'));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};
```
