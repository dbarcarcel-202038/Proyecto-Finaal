import Category from '../category/category.model.js'
import Product from '../product/product.model.js'
import { checkUpdateClient } from '../../utils/validator.js'
import Bill from '../bill/bill.model.js'
import mongoose from 'mongoose';


export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'Nice test' })
}

export const addProduct = async (req, res) => {
    try {
        let data = req.body
        let category = await Category.findOne({ _id: data.category })
        if (!category) return res.status(404).send({ message: 'The product was not found' })
        let product = new Product(data)
        await product.save()
        return res.send({ message: 'A new product has been added' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error while saving the product' })
    }
}

export const updateProduct = async (req, res) => {
    try {
        let data = req.body
        let { id } = req.params
        let update = checkUpdateClient(data, false)
        if (!update) return res.status(400).send({ message: 'You have submitted some data that cant be updated or youve been missing data' })
        let updatePro = await Product.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        ).populate('category')
        if (!updatePro) return res.status(401).send({ message: 'The product has not been found, therefore, it will not be updated' })
        return res.send({ message: 'Product updated correctly', updatePro })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating the product' })
    }
}

export const delet3 = async (req, res) => {
    try {
        let { id } = req.params
        let deleteProduct = await Product.findOneAndDelete({ _id: id })
        if (!deleteProduct) return res.status(404).send({ message: 'the product does not exist' })
        return res.send({ message: `The product with the name ${deleteProduct.name} was successfully deleted ` })
    } catch (error) {
        console.error(error)
        return res.status(404).send({ message: 'Error when deleting the product' })
    }
}

export const searchProduct = async (req, res) => {
    try {
        let { search } = req.params
        let product = await Product.find({ name: search }).populate('category')
        if (!product) return res.status(404).send({ message: 'The product was not found' })
        return res.send({ message: 'Yay we have the product', product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error when searching for the product' })
    }
}

export const catalogueProducts = async (req, res) => {
    try {
        let data = await Product.find().populate('category')
        return res.send({ data })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Data cannot bee extracted' })
    }
}

export const outOfStockProducts = async (req, res) => {
    try {
        let data = await Product.findOne({ stock: 0 }).populate('category')
        if (!data) return res.status(444).send({ message: "There arent products out of stock" })
        return res.send({ data })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'The data cant bee extracted' })
    }
}



export const mostDemandProducts = async (req, res) => {
    try {
        const mostDemandProducts = await Bill.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);

        const productsDetails = await Product.find({ _id: { $in: mostDemandProducts.map(item => item._id) } });

        const mostDemandProductsDetails = mostDemandProducts.map(item => {
            const productDetail = productsDetails.find(product => product._id.toString() === item._id.toString());
            return {
                product: productDetail,
                totalQuantity: item.totalQuantity
            };
        });

        return res.status(200).send(mostDemandProductsDetails);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error searching the products whit the most demand', error: error });
    }
}

export const byCategory = async (req, res) => {
    try {
        let { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'Category ID not found' });
        }

        let products = await Product.find({ category: id });

        return res.status(200).send(products);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error searching the products by category', error: error });
    }
};
