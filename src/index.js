const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const multer = require('multer');
const collection = require('./config');
const session = require('express-session');
const { default: mongoose } = require('mongoose');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(session({
    secret: '#Dispensary#254#Booking',
    resave: false,
    saveUninitialized: false
}));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('login');
})

app.get('/signup', (req, res) => {
    res.render('signup');
})

//signup
app.post("/signup", upload.single('image'), async(req, res) => {
    try{
    const data = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        mobilenumber: req.body.mobilenumber,
        password: req.body.password,
        image: req.file ? `/uploads/${req.file.filename}` : null
    }

    const existingUser = await collection.findOne({email: data.email});
    if(existingUser) {
        return res.status(400).render('signup', {error:"User already exists. Please choose a different email."});
    }else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword;

        const userdata = await collection.create(data);
        res.redirect("/")
    }
    } catch(e) {
        console.log(e);
        res.redirect("/signup")
    }    
});

//login
app.post("/login", async(req, res) => {
    try{
        const check = await collection.findOne({email: req.body.email});
        if(!check){
            return res.status(400).render('login',{error:"User name cannot be found"});
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch){
            req.session.userId = check._id;
            req.session.email = check.email;
            return res.redirect(`/home/${check._id}`);
        }else{
            return res.status(400).render('login', {error:"Password is incorrect"});
        }
    }catch{
        return res.status(500).render('login', {error:"Invalid Details"});
    }
})

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.redirect('/');
    }
}

app.get("/home/:id", isAuthenticated, async(req, res) => {
    try{
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid ID format");
        }
        
        const user = await collection.findOne({_id: id});
        if (!user) {
            console.log("No user found with that ID");
            return res.status(404).send("User not found");
        }
        res.render('home', {user, session: req.session});
    }catch (error) {
        console.error(error);
        res.status(500).send("Error: " + error.message);
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Could not log out.");
        } else {
            res.redirect('/');
        }
    });
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})