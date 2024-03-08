import Bill from './bill.model.js'
import Product from '../product/product.model.js'

export const update = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        const { product, quantity } = req.body;

        if (!product && !quantity) {
            return res.status(400).send({ message: 'Product and quantity are required' });
        }

        const bill = await Bill.findById(id);
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found' });
        }

        const itemToUpdate = bill.items.find(item => item._id.toString() === itemId);
        if (!itemToUpdate) {
            return res.status(404).send({ message: 'Item not found in the bill' });
        }

        if (product) {
            itemToUpdate.product = product;

            const productInfo = await Product.findById(product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            const oldUnitPrice = itemToUpdate.unitPrice;
            itemToUpdate.unitPrice = productInfo.price;

            bill.totalAmount += (itemToUpdate.unitPrice - oldUnitPrice) * itemToUpdate.quantity;

            if (quantity !== undefined) {
                const oldQuantity = itemToUpdate.quantity;
                const quantityDifference = quantity - oldQuantity;
                productInfo.stock -= quantityDifference;
                await productInfo.save();
            }
        }
        if (quantity !== undefined) {
            const oldQuantity = itemToUpdate.quantity;
            const quantityDifference = quantity - oldQuantity;
            itemToUpdate.quantity = quantity;

            bill.totalAmount += quantityDifference * itemToUpdate.unitPrice;

            const productInfo = await Product.findById(itemToUpdate.product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            productInfo.stock -= quantityDifference; 
            await productInfo.save();
        }

        await bill.save();

        return res.send({ message: 'Item updated successfully', bill });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating item' });
    }
};