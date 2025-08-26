// const {Router} = require("express");
// const multer = require("multer");
// const router = Router();
// const path = require("path");
// const Blog = require('../models/blog');
// const Comment = require("../models/comments");

// const storage = multer.diskStorage({
//     destination: function(req,file,cb) {
//         cb(null,path.resolve(`./public/uploads/`));
//     },
//     filename: function(req,file,cb) {
//         const fileName = `${Date.now()}-${file.originalname}`;
//         cb(null,fileName);
//     },
// });
// const upload = multer({storage});

// router.get('/add-new',(req,res) => {
//     return res.render('addBlog',{
//         user: req.user,
//     })
// })

// router.get('/:id',async (req,res) => {
//     const blog = await Blog.findById(req.params.id).populate("createdBy");
//     const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
//     return res.render("blog",{
//         user: req.user,
//         blog,
//         comments,
//     })
// })

// router.post('/comment/:blogId', async(req,res) => {
//     await Comment.create({
//         content: req.body.content,
//         blogId: req.params.blogId,
//         createdBy: req.user._id,
//     })
//     return res.redirect(`/blog/${req.params.blogId}`);
// })

// router.post('/', upload.single('coverImage'), async (req,res) => {
//     const {title,body} = req.body;
//     const blog = await Blog.create({
//         body,
//         title,
//         createdBy: req.user._id,
//         coverImageURL: `uploads/${req.file.filename}`,
//     });
//     return res.redirect(`/blog/${blog._id}`);
// })

// module.exports = router;


const { Router } = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Blog = require('../models/blog');
const Comment = require("../models/comments");

const router = Router();

// --- START: CLOUDINARY CONFIGURATION ---
// Configure Cloudinary:
// IMPORTANT: Make sure you have these environment variables set in Railway.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary for storage instead of local disk
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-covers', // The name of the folder in Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg'], // Allowed image formats
  },
});

const upload = multer({ storage: storage });
// --- END: CLOUDINARY CONFIGURATION ---


router.get('/add-new', (req, res) => {
    return res.render('addBlog', {
        user: req.user,
    });
});

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
    });
});

router.post('/comment/:blogId', async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

// --- START: CORRECTED UPLOAD ROUTE ---
// The middleware 'upload.single('coverImage')' now sends the file to Cloudinary
router.post('/', upload.single('coverImage'), async (req, res) => {
    const { title, body } = req.body;

    // Check if a file was uploaded. If not, req.file will be undefined.
    if (!req.file) {
        // Handle the case where no file is uploaded, if you want to allow that.
        // For now, let's assume an image is required.
        // You can add better error handling here.
        return res.status(400).send("No image uploaded.");
    }

    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        // IMPORTANT: Use req.file.path to get the secure URL from Cloudinary
        coverImageURL: req.file.path, 
    });
    return res.redirect(`/blog/${blog._id}`);
});
// --- END: CORRECTED UPLOAD ROUTE ---

module.exports = router;