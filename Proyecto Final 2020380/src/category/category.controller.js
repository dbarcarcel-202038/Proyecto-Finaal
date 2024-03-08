import { checkUpdateClient } from '../../utils/validator.js'
import Category from '../category/category.model.js'
import Product from '../product/product.model.js'

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'Nice test' })
}

export const addCategory = async (req, res) => {
    try {
        let data = req.body
        let existingCategory = await Category.findOne({ name: data.name });
        if (existingCategory) {
            return res.status(400).send({ message: 'The category with this name already exists' });
        }

        let category = new Category(data)
        await category.save()
        return res.send({ message: 'A new category was successfully added' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error saving the category' })
    }
}

export const updateCategory = async (req, res) => {
    try {
        let data = req.body
        let { id } = req.params
        let update = checkUpdateClient(data, id)
        if (update === false) return res.status(400).send({ message: 'Enter all the data' })
        let updateCat = await Category.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )
        if (!updateCat) return res.status(401).send({ message: 'The category has not been found, therefore, it will not be updated' })
        return res.send({ message: 'Category updated correctly', updateCat })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating the category' })

    }
}

export const delet3 = async (req, res) => {
    try {
        let { id } = req.params;
        
        let categoryToDelete = await Category.findById(id);
        if (!categoryToDelete) {
            return res.status(404).send({ message: 'The category doesnt exist' });
        }

        let defaultCategory = await Category.findOne({ name: 'Default' });
        if (!defaultCategory) {
            return res.status(404).send({ message: 'The default category was not found' });
        }

        let updateProducts = await Product.updateMany(
            { category: categoryToDelete._id },
            { $set: { category: defaultCategory._id } }
        );

        let deleteCategory = await Category.findOneAndDelete({ _id: id });
        if (!deleteCategory) {
            return res.status(404).send({ message: 'Error deleting category' });
        }

        return res.send({ message: `The category whit the name ${deleteCategory.name} was successfully deleted ` });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Internal server error' });
    }
};

export const findCategory = async (req, res) => {
    try {
        let data = await Category.find()
        return res.send({data})
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Data cannot be extracted' })
    }
}

export const defaultCategory = async () => {
    try {
        const existingCategory = await Category.findOne({ name: 'Default' });

        if (existingCategory) {
            return; 
        }
        let data = {
            name: 'Default',
            description: 'default'
        }

        let category = new Category(data)
        await category.save()

    } catch (error) {
        console.error(error)
    }
}