import Shopping from './cart.model.js'
import jwt from 'jsonwebtoken'
import Product from '../product/product.model.js'
import Bill from '../bill/bill.model.js'
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


export const tester = (req, res) => {
    console.log('Testing underway')
    res.send({ message: 'test successful' })
}

export const purchaseHandler = async (req, res) => {
    try {
        let { item, quantity } = req.body;
        let { completePurchase } = req.body;
        let userID = req.user._id

        const productData = await Product.findById(item);
        if (!productData || productData.stock === 0 || quantity > productData.stock) {
            return res.status(400).send({ message: 'Insufficient stock' });
        }

        if (!completePurchase) {
            let shoppingCart = await ShoppingCart.findOne({ user: userID });

            if (!shoppingCart) {
                const newCart = new ShoppingCart({
                    user: userID,
                    items: [{ item: item, quantity }],
                    total: 0 
                });
                let total = 0;
                for (const product of newCart.items) {
                    let productData = await Product.findById(product.item);
                    if (productData) {
                        total += productData.price * product.quantity;
                    }
                }
                newCart.total = total;

                await newCart.save();

                return res.status(200).send({ message: 'Item added to shopping cart successfully.', total });
            }

            const itemIndex = shoppingCart.items.findIndex(p => p.item.equals(item));

            if (itemIndex !== -1) {
                shoppingCart.items[itemIndex].quantity += parseInt(quantity);
            } else {
                shoppingCart.items.push({ item: item, quantity });
            }


            let total = 0;
            for (const product of shoppingCart.items) {
                const productData = await Product.findById(product.item);
                if (productData) {
                    total += productData.price * product.quantity;
                }
            }
            shoppingCart.total = total;

            await shoppingCart.save();
            return res.status(200).send({ message: 'Item added to shopping cart successfully.', total });
        } else {
            if (completePurchase !== 'CONFIRM') return res.status(400).send({ message: `Confirmation word must be -> CONFIRM` });

            const shoppingCart = await ShoppingCart.findOne({ user: userID });

            if (!shoppingCart) {
                return res.status(400).send({ message: 'Shopping cart is empty.' });
            }

            const invoiceItems = [];
            for (const item of shoppingCart.items) {
                const productData = await Product.findById(item.item);
                if (productData) {
                    invoiceItems.push({
                        item: item.item,
                        quantity: item.quantity,
                        unitPrice: productData.price, 
                        totalPrice: productData.price * item.quantity 
                    });
                }
            }

            const invoice = new Invoice({
                user: shoppingCart.user,
                items: invoiceItems,
                totalAmount: shoppingCart.total
            });
            const savedInvoice = await invoice.save();

            for (const item of shoppingCart.items) {
                const productData = await Product.findById(item.item);
                if (productData) {
                    productData.stock -= item.quantity;
                    await productData.save();
                }
            }


            await ShoppingCart.deleteOne({ _id: shoppingCart._id });

            const pdfPath = await generateInvoicePDF(savedInvoice);
            console.log('PDF generated:', pdfPath);
            return res.status(200).send({ message: 'Purchase completed successfully and invoice generated.', invoice: savedInvoice });

        }

    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error registering ', error: error });
    }
}

// Function para generar PDF del invoice
export const generateInvoicePDF = async (invoice) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const __filename = fileURLToPath(import.meta.url);
        const currentDir = dirname(__filename);
        const invoicesDir = join(currentDir, '..', '..', 'invoices'); 
        const pdfPath = join(invoicesDir, `InvoiceNo.${invoice._id}.pdf`); 

        const stream = doc.pipe(fs.createWriteStream(pdfPath)); 

        doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown();

        doc.fontSize(12).text(`User: ${invoice.user}`, { align: 'left' });
        doc.text(`Date: ${invoice.date}`, { align: 'left' }).moveDown();

        doc.text('Invoice Items:', { align: 'left' }).moveDown();

        for (const item of invoice.items) {
            doc.text(`- Item: ${item.item}, Quantity: ${item.quantity}, Unit Price: ${item.unitPrice}`, { align: 'left' });
        }

        doc.moveDown().text(`Total: ${invoice.totalAmount}`, { align: 'right' });

        doc.end();

        stream.on('finish', () => {
            resolve(pdfPath);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
};
