import Bill from './bill.model.js'
import Product from '../product/product.model.js'
export const updateReceiptItem = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        const { newProductId, newQuantity } = req.body;

        if (!newProductId && !newQuantity) {
            return res.status(400).send({ message: 'New product ID and quantity are required' });
        }

        const receipt = await Bill.findById(id);
        if (!receipt) {
            return res.status(404).send({ message: 'Receipt not found' });
        }

        const itemToUpdate = receipt.items.find(item => item._id.toString() === itemId);
        if (!itemToUpdate) {
            return res.status(404).send({ message: 'Item not found in the receipt' });
        }

        if (newProductId) {
            itemToUpdate.product = newProductId;

            const productInfo = await Product.findById(newProductId);
            if (!productInfo) {
                return res.status(404).send({ message: 'New product not found' });
            }
            const oldUnitPrice = itemToUpdate.unitPrice;
            itemToUpdate.unitPrice = productInfo.price;

            receipt.totalAmount += (itemToUpdate.unitPrice - oldUnitPrice) * itemToUpdate.quantity;

            if (newQuantity !== undefined) {
                const oldQuantity = itemToUpdate.quantity;
                const quantityDifference = newQuantity - oldQuantity;
                productInfo.stock -= quantityDifference;
                await productInfo.save();
            }
        }
        if (newQuantity !== undefined) {
            const oldQuantity = itemToUpdate.quantity;
            const quantityDifference = newQuantity - oldQuantity;
            itemToUpdate.quantity = newQuantity;

            receipt.totalAmount += quantityDifference * itemToUpdate.unitPrice;

            const productInfo = await Product.findById(itemToUpdate.product);
            if (!productInfo) {
                return res.status(404).send({ message: 'Product not found' });
            }
            productInfo.stock -= quantityDifference; 
            await productInfo.save();
        }

        await receipt.save();

        return res.send({ message: 'Item updated successfully', receipt });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating item' });
    }
};
