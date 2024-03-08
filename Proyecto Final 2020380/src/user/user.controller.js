import { generateJwt } from '../../utils/jwt.js'
import { compareThePassword, encrypt, checkUpdateClient, checkUpdateAdmin } from '../../utils/validator.js'
import User from '../user/user.model.js'
import jwt from 'jsonwebtoken'
import Bill from '../bill/bill.model.js'
import Shopping from '../cart/cart.model.js'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'Nice test' })
}

export const sign = async (req, res) => {
    try {
        let data = req.body
        let existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
            return res.status(400).send({ message: ' Username is already in use currently' });
        }
        data.password = await encrypt(data.password)
        data.role = 'CLIENT'
        let user = new User(data)
        await user.save()
        return res.send({ message: `Successfully registered, you can be logged with your username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error when registering your user', err: err })
    }
}

export const signAdmin = async (req, res) => {
    try {
        let data = req.body
        let existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
            return res.status(400).send({ message: 'Username is already in use currently' });
        }
        data.password = await encrypt(data.password)
        data.role = 'ADMIN'
        let user = new User(data)
        await user.save()
        return res.send({ message: `Successfully registered, you can be logged with your username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error when registering your user', err: err })
    }
}

export const login = async (req, res) => {
    try {
        let { user, password } = req.body
        let users = await User.findOne({
            $or: [
                { username: user },
                { email: user }
            ]
        });
        if (users && await compareThePassword(password, users.password)) {
            let loggedUser = {
                uid: users.id,
                username: users.username,
                name: users.name,
                role: users.role
            }
            let token = await generateJwt(loggedUser)
            return res.send({ message: `Welcome ${loggedUser.name}`, loggedUser, token })

        }
        return res.status(404).send({ message: 'Invalid credentials' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error logging in' })
    }
}

export const update = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let uid = req.user._id
        let role = req.user.role
        switch (role) {
            case 'ADMIN':
                let update = checkUpdateAdmin(data, id)
                if (!update) return res.status(400).send({ message: 'You have submitted some data that cant be updated or youve been missing data' })
                let updatedUser = await User.findOneAndUpdate(
                    { _id: id }, 
                    data, 
                    { new: true } 
                )
                if (!updatedUser) return res.status(401).send({ message: 'The user has not been found, therefore, it will not be updated' })
                return res.send({ message: 'User updated correctly', updatedUser })
                break;

            case 'CLIENT':
                let updated = checkUpdateClient(data, id)
                if(id != uid) return  res.status(401).send({ message: 'You can only update your own account' })
                if (!updated) return res.status(400).send({ message: 'You have submitted some data that cant be updated or youve been missing data' })
                let updatedUsers = await User.findOneAndUpdate(
                    { _id: uid }, 
                    data, 
                    { new: true } 
                )
                if (!updatedUsers) return res.status(401).send({ message: 'The user has not been found, therefore, it will not be updated' })
                return res.send({ message: 'Updated user', updatedUsers })
                break;
        }

    } catch (err) {
        console.error(err)
        if (err.keyValue.username) return res.status(400).send({ message: `Username ${err.keyValue.username} is alredy in use` })
        return res.status(500).send({ message: 'Error updating your account' })
    }
}

export const delet3 = async (req, res) => {
    try {
        let { id } = req.params
        let { validationKeyword } = req.body
        let uid = req.user._id
        let role = req.user.role
        switch (role) {
            case 'ADMIN':
                if (!validationKeyword) return res.status(400).send({ message: `Keyword required.` });
                if (validationKeyword !== 'CONFIRM') return res.status(400).send({ message: `The keyword is "CONFIRM"` });
                let deletedUser = await User.findOneAndDelete({ _id: id })
                if (!deletedUser) return res.status(404).send({ message: 'The account has not been found, therefore, it will not be deleted' })
                return res.send({ message: `The account with the username ${deletedUser.username} was succesfully deleted` }) 
                break;

            case 'CLIENT':
                if (!validationKeyword) return res.status(400).send({ message: `Keyword Required` });
                if (validationKeyword !== 'CONFIRM') return res.status(400).send({ message: `The keyword is "CONFIRM"` });
                if(id != uid) return  res.status(401).send({ message: 'You can only update your own account' })
                let deletedUsers = await User.findOneAndDelete({ _id: uid })
                if (!deletedUsers) return res.status(404).send({ message: 'The account has not been found, therefore, it will not be deleted' })
                return res.send({ message: `The account with the username ${deletedUsers.username} was succesfully deleted` }) 
                break;
        }

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting the account' })
    }
}

export const defaultAdmin = async () => {
    try {
        const existingUser = await User.findOne({ username: 'default' });

        if (existingUser) {
            return; 
        }
        let data = {
            name: 'Default',
            surname: 'default',
            username: 'default',
            email: 'default@gmail.com',
            password: await encrypt('12345678'),
            role: 'ADMIN'
        }

        let user = new User(data)
        await user.save()

    } catch (error) {
        console.error(error)
    }
}

export const purchaseHystory = async (req, res) => {
    try {
        let uid = req.user._id

        let purchase = await Bill.find({user: uid}).populate({
            path: 'items',
            populate: {
                path: 'product', 
                model: 'product', 
                select: 'name' 
            }
        });
        return res.send(purchase)

    
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error getting the purchase history', error: error });
    }
}