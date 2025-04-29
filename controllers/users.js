/*
Sign-up rules
1. personal_id, name, email, password, and confirmPassword are required.
2. User’s name must be at least 3 characters long.
3. password and confirmPassword entered by the user must match.
4. User’s email must be properly validated and follow the correct format.
5. password must contain at least one lowercase letter, one uppercase letter, and one number, with a length between 6 to 20 characters.
6. If email is already registered in database, user cannot sign up again using the same email.
*/

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/users.js';

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
            const newUser = new Users({
                personal_id,
                name,
                email,
                password: hashedPassword,
                address,
                phone_number
            });

            await newUser.save();

            res.status(200).json({
                message: "User registered successfully!",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email
                }
            })
    }   catch (error) {
            return res.status(500).json({message: error.message});
    }
}