const { Router } = require("express");
const User = require('../models/user');
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const router = Router();

// --- CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-pictures',
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ storage: storage });
// --- END CLOUDINARY CONFIGURATION ---


router.get('/signin', (req, res) => {
    return res.render("signin");
});

router.get('/signup', (req, res) => {
    return res.render("signup");
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenToken(email, password);
        return res.cookie("token", token).redirect("/");
    } catch (error) {
        return res.render('signin', {
            error: "Incorrect Email or Password",
        });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie("token").redirect("/");
});


// --- START: UPDATED SIGNUP ROUTE WITH ENHANCED LOGGING ---
router.post('/signup', upload.single('profileImage'), async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
    
        const userPayload = {
            fullName,
            email,
            password,
        };

        if (req.file) {
            userPayload.profileImageURL = req.file.path;
        }

        await User.create(userPayload);
        return res.redirect('/');

    } catch (error) {
        // This new logging is more specific and should reveal the error.
        console.error("--- SIGNUP FAILED ---");
        console.error("Error Message:", error.message); // Print just the message
        console.error("Full Error Stack:", error.stack); // Print the full stack trace
        console.error("---------------------");
        
        return res.status(500).send("Internal Server Error. Check the logs for details.");
    }
});
// --- END: UPDATED SIGNUP ROUTE ---

module.exports = router;
