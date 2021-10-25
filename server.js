const cookieParser = require('cookie-parser');
const sharp = require('sharp');
const express=require('express');
const bcrypt = require('bcryptjs')
const multer = require('multer');
const axios = require('axios')
const jwt = require('jsonwebtoken')
const app=express();
const User = require('./models/User');
const Feedback = require('./models/Feedback');
const { sendBothMails } = require('./utils/mail')
const auth = require('./middleware/auth')
require('./db');

// const {OAuth2Client} = require('google-auth-library');
const { update } = require('./models/User');
// const CLIENT_ID='862720543749-dpdhr7rl4sbhn35qo6ddfnq0csrsq579.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REFRESH_TOKEN = "1//04Nhy9N9yHe_NCgYIARAAGAQSNwF-L9IrVJslkvuXgWGaaS7BEmlUs6rudJCRomlMabnziPsAiqYkj1VIsRPSI-d7Y-2HImuq6M4"
// const ACCESS_TOKEN = "ya29.a0ARrdaM-7ANEnDifW8JNEuZsqjeOHIyhuNtRhWOL7HTZBw2O0YWJtpkaBdIL2rxcNWJHlYyflyJhhrOvE5dM6FHPsRz2TR6v8vxxUITsniwzYdBYvoZElHYSk_omQu-el909zscuVIgM43jKcGpuveVwsLOGc"
// const client = new OAuth2Client(CLIENT_ID);

// const ZOOM_API_KEY = 'xFupMUSdTUG_gw9mykEhtw';
// const ZOOM_API_SECRET = 'mnyDlHyPwj1hDilQHoZd8DzcGjmMz0bMLwWa';

const PORT=process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());

app.get('/', (req,res) => {
    res.render('login');
})
app.get('/login', (req,res) => {
    res.render('login');
})

app.post('/register', async (req, res) => {
    try {
        const user = new User(req.body.formData);
        await user.save();
        const token = await user.generateAuthToken();
        res.cookie('session-token', token);
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})

app.post('/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.loginData.email, req.body.loginData.password)
        
        const token = await user.generateAuthToken()
        res.cookie('session-token', token);
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
})
// app.post('/login', (req,res) => {
//     let token=req.body.token;
//     // console.log(token);
//     async function verify() {
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
//             // Or, if multiple clients access the backend:
//             //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
//         });
//         const payload = ticket.getPayload();
//         const userid = payload['sub'];
//         // console.log(payload);
//         let user = await User.findOne({ email: payload.email })
//         // console.log(user);
//         if (!user) {
//             const { name, email, picture, email_verified } = payload;
//             user = new User({
//                 name,
//                 email,
//                 picture,
//                 email_verified
//             })
//             await user.save();
//         }
//         // If request specified a G Suite domain:
//         // const domain = payload['hd'];
//       }
//       verify()
//       .then(()=>{
//           res.cookie('session-token', token);
//           res.send('success');
//       }).
//       catch(console.error);
// })
app.get('/dashboard', auth, async (req,res) => {
    try {
        let user=req.user;
        res.render('dashboard', { user });
    } catch (error) {
        console.error(error);
    }
    
})
app.get('/protectedroute', auth, (req,res) => {
    res.render('protectedroute');
})
app.get('/edit_profile', auth, async (req, res) => {
    try {
        // get a set (unique) of skills combining skill field of each user
        const skills = await User.distinct('skills');
        res.render('edit_profile', { skills });
    } catch (error) {
        console.error(error.msg);
    }
})
app.put('/edit_profile', auth, async (req, res) => {
    try {
        let updates = req.body.updates;
        let user = req.user;
        if (updates.skill) {
            if (!user.skills.includes(updates["skill"])) {
                user.skills.push(updates["skill"]);
            }
            delete updates["skill"];
        }
       
        for (const [key, value] of Object.entries(updates)) {
            user[`${key}`] = value;
        }
        
        await user.save();
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error);
    }

})

app.get('/find_match', auth, async (req, res) => {
    try {
        const skills = await User.distinct('skills');
        res.render('find_match', { skills });
    } catch (error) {
        console.error(error);
    }
})
app.post('/find_match', auth, async (req, res) => {
    try {
        let user = req.user;
        let matchedUsers = await User.find({ skills: req.body.skill, email: { $ne: req.user.email } })
        let randomNo = generateRandom(0, matchedUsers.length - 1);
        let randomUser = matchedUsers[randomNo];

        const mail = await sendBothMails(req.user.name, randomUser.email,req.body.skill, req.body.meetLink);
        await mail.send();
        res.redirect('/dashboard')
        
    } catch (error) {
        console.error(error);
    }
})


app.post('/previousFeedback', auth, async (req, res) => {
    try {
        const feedback = new Feedback({
            ...req.body,
            user: req.user._id
        });
        await feedback.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
})

app.post('/dashboard', auth, async (req, res) => {
    console.log(req.body.confirmPassword);
    res.redirect('/dashboard')
})


// multer filter
const multerFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload a valid image'), false)
    }

    cb(undefined, true)
}

const upload = multer({
    fileFilter: multerFilter,
    limits: {
        fileSize: 1000000
    },
    
})



app.post('/uploadPhoto', auth, upload.single("profilePic"), async (req, res) => {
    try {
        const Buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
        req.user.picture = Buffer;
        // console.log(Buffer)
        await req.user.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
    
})

app.post('/changePassword', auth, async(req, res) => {
    try {
        let user = req.user;
        user.password = req.body.newPassword;
        await user.save();
        res.redirect('/dashboard');
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

app.get('/logout', (req,res) => {
    res.clearCookie('session-token');
    res.redirect('/login');
})

const getZoomLink = async (email) => {
    const payload = {
        iss: ZOOM_API_KEY,
        exp: ((new Date()).getTime() + 5000)
    };
    const token = jwt.sign(payload, ZOOM_API_SECRET);
    const data = await axios.post(`https://api.zoom.us/v2/users/${email}/meetings`, {
        topic: "Random match meeting",
        type: 1,
        settings: {
        host_video: "true",
        participant_video: "true"
      }
    }, {
        headers: {
            "User-Agent": "Zoom-api-Jwt-Request",
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    return data.data;
}

// function getDateAndTime() {
//     timestamp = Date.now()
//     let timeZone = "Asia/Kolkata";
//     let locale = "en-GB";
//     const human = new Date(timestamp).toLocaleString(locale,{
//     timeZone : timeZone
//     })
//     const arr = human.split(",")

//     const timestr = arr[1].trim()
//     let time = "";
//     let counter = 0;
//     for (let i = 0; i < timestr.length; ++i) {
//     if (timestr[i] === ":") {
//         counter++;
//     }
//     if (counter === 2) {
//         break;
//     }
//     time += timestr[i]
//     }
    // console.log(time)

    // console.log(arr[0].split)
//     const datearr = arr[0].split("/");
//     let temp = datearr[0];
//     datearr[0] = datearr[2];
//     datearr[2] = temp;
//     let date = datearr.join("-")

//     return [date, time];
// }

// async function getLink() {
//     let stamp = getDateAndTime(); 
//     const meeting = await Meeting({
//             clientId : CLIENT_ID,
//             clientSecret : CLIENT_SECRET,
//             refreshToken : REFRESH_TOKEN,
//             date : stamp[0],
//             time : stamp[1],
//             summary : 'Meet link',
//             location : 'Asia/Kolkata',
//             description : 'Random talk meet link'
//     })
//         // console.log(meeting);
//          return meeting
// }

function generateRandom (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function checkAuthenticated(req, res, next){

//     let token = req.cookies['session-token'];

//     let user = {};
//     async function verify() {
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
//         });
//         const payload = ticket.getPayload();
//         user.name = payload.name;
//         user.email = payload.email;
//         user.picture = payload.picture;
//       }
//       verify()
//       .then(()=>{
//           req.user = user;
//           next();
//       })
//       .catch(err=>{
//           res.redirect('/login')
//           console.log('Unauthorized');
//       })

// }


app.listen(PORT, ()=>{
    console.log('Server listening to port ' + PORT);
})