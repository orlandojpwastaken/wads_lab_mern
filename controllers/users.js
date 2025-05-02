import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/users.js';
import { userMailSend } from './userMailSend.js';

const { DEFAULT_CLIENT_URL } = process.env

// Checks for conditions in rule 3
function isMatch(password, confirmPassword) {
    if (password == confirmPassword) return true
    return false
}

// Checks for conditions in rule 4
function validateEmail(email) {
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return regex.test(email)
}

// Checks for conditions in rule 5
function validatePassword(password) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
    return regex.test(password)
}

// Generates refresh tokens
function createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1d'})
}

// Sign up method (along with the rest of the condition checks)
export const signUp = async (req,res) => {
    try {
        const {personal_id, name, email, password, confirmPassword, address, phone_number} = req.body;

        if (!personal_id || !name || !email || !password || !confirmPassword) {
            return res.status(400).json({message: "Please fill in all fields!"})            
        }

        if (name.length < 3) return res.status(400).json({message: "Your name must be at least 3 letters long long!"})

        if (!isMatch(password, confirmPassword)) return res.status(400).json({message: "Passwords don't match. Please try again!"})
        
        if (!validateEmail(email)) return res.status(400).json({message:"Invalid email address"})

        if (!validatePassword(password)) return res.status(400).json({message: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"})

            const existingUser = await Users.findOne({email});
            if (existingUser) {
                return res.status(400).json({message: "This email is already registered "})
            }

            // Password hashing
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt)
            
            const newUser = {
                personal_id,
                name,
                email,
                password: hashedPassword,
                address,
                phone_number
            };

            // Sends email to new user
            const refreshToken = createRefreshToken(newUser)

            const url = `${DEFAULT_CLIENT_URL}/user/activate/${refreshToken}`;

            try {
                await userMailSend(email, url, "Verify your email address", "Confirm Email")
                res.json({ message: "Register Success! Please activate your email to start" });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                res.status(500).json({ message: "Registration successful but email sending failed. Please try logging in." });
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
}

// Email Activation
export const activateEmail = async (req, res) => {
    try {
        const { activation_token } = req.body;
        const user = jwt.verify(activation_token, process.env.REFRESH_TOKEN_SECRET)

        const { personal_id, name, email, password, address, phone_number } = user

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "This email already exists." });
        }

        const newUser = new Users({
            personal_id,
            name,
            email,
            password,
            address,
            phone_number
        })

        await newUser.save()

        res.json({ message: "Account has been activated. Please login now!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// Sign in method
export const signIn = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await Users.findOne({email});

        if (!email || !password) return res.status(400).json({message: "Please fill in all of the fields"})
            
        if (!user) return res.status(400).json({message: "Invalid Credentials"})

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({message: "Invalid Credentials"})
        
        const refresh_token = createRefreshToken({ id:user._id })

        const expiry = 24 * 60 * 60 * 1000 // 1 day expiry period

        res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/api/user/refresh_token',
            maxAge: expiry,
            expires: new Date(Date.now( + expiry))
        })
        
        res.json({
            message: "Sign In successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }   catch (error) {
        return res.status(500).json({message: error.message});
    }
}

// User Information Method
export const userInfo = async (req, res) => {
    try {
        const userId = req.user.id
        const userInfo = await Users.findById(userId).select("-password")

        res.json(userInfo)
    }   catch (error) {
        return res.status(500).json({message:error.message});
    }
}