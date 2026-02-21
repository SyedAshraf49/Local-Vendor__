import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { useTranslations } from '../../hooks/useTranslations';
import { type Product, type Order, type ProductLocation } from '../../types';
import OrderDetailModal from './OrderDetailModal';
import ProductEditModal from './ProductEditModal';
import PreOrderManagement from './PreOrderManagement';
import { EditIcon, TrashIcon } from '../common/Icons';
import EarningsReport from './EarningsReport';
import { useProducts } from '../../context/ProductContext';

const VendorDashboard: React.FC = () => {
    const { user } = useAuth();
    const { orders } = useOrders();
    const t = useTranslations();
    const { addToast } = useToast();
    const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts();
    
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isResetConfirmOpen, setResetConfirmOpen] = useState(false);

    // Filter inventory and orders for the currently logged-in vendor
    const { vendorInventory, vendorOrders } = useMemo(() => {
        if (user?.type === 'vendor' && user.location) {
            return {
                vendorInventory: products.filter(p => p.location === user.location),
                vendorOrders: orders.filter(o => o.vendorLocationName === user.location),
            };
        }
        return { vendorInventory: [], vendorOrders: [] };
    }, [user, products, orders]);
    
    const lastOrderTimestamp = useMemo(() => vendorOrders[0]?.timestamp, [vendorOrders]);

    useEffect(() => {
        if (lastOrderTimestamp) {
            const latestOrder = vendorOrders[0];
            if ((Date.now() - latestOrder.timestamp.getTime()) < 5000) {
                 addToast(`${t.newOrderReceived} - ${latestOrder.customerName}`, 'success');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastOrderTimestamp]);

    const handleOpenEditModal = (product: Product) => {
        setEditingProduct(product);
        setProductModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setProductModalOpen(true);
    };

    const handleDeleteProduct = (productId: number) => {
        deleteProduct(productId);
        addToast(t.productDeleted, 'success');
    };

    const handleResetProducts = () => {
        resetProducts();
        addToast(t.productsReset, 'success');
        setResetConfirmOpen(false);
    };

    const handleSaveProduct = (product: Product) => {
        const productWithLocation = { ...product, location: user?.location as ProductLocation };

        if (editingProduct) { // Update existing
            updateProduct(productWithLocation);
            addToast(t.productUpdated, 'success');
        } else { // Add new
            addProduct(productWithLocation);
            addToast(t.productAdded, 'success');
        }
        setProductModalOpen(false);
        setEditingProduct(null);
    };

    return (
        <div className="container mx-auto animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">{t.welcome}, {user?.name}!</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Incoming Orders */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.incomingOrders}</h3>
                     <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                        {vendorOrders.length > 0 ? (
                            vendorOrders.map(order => (
                                <div key={order.id} className="p-4 border dark:border-gray-600 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-700 dark:text-gray-300">Order #{order.id.slice(-6)}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerName}</p>
                                        </div>
                                        <button onClick={() => setSelectedOrder(order)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                            {t.viewDetails}
                                        </button>
                                    </div>
                                    <p className="text-right font-bold mt-2 text-indigo-600 dark:text-indigo-400">Total: ₹{order.total.toFixed(2)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No new orders yet.</p>
                        )}
                    </div>
                </div>

                {/* Inventory */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t.inventory}</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setResetConfirmOpen(true)} className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 py-2 px-4 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                                {t.resetProducts}
                            </button>
                            <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700">
                                {t.addProduct}
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-[32rem] overflow-y-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t.product}</th>
                                    <th scope="col" className="px-6 py-3">{t.stock}</th>
                                    <th scope="col" className="px-6 py-3">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendorInventory.map(item => (
                                    <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name}</th>
                                        <td className="px-6 py-4">{`${item.stock} ${item.unit}`}</td>
                                        <td className="px-6 py-4 flex items-center space-x-2">
                                            <button onClick={() => handleOpenEditModal(item)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title={t.editProduct}>
                                                <EditIcon className="h-5 w-5"/>
                                            </button>
                                            <button onClick={() => handleDeleteProduct(item.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title={t.deleteProduct}>
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <PreOrderManagement />
                </div>

                <div className="md:col-span-2">
                    <EarningsReport />
                </div>
            </div>
            {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            {isProductModalOpen && <ProductEditModal product={editingProduct} onSave={handleSaveProduct} onClose={() => setProductModalOpen(false)} />}
            {isResetConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-scale-in">
                        <header className="p-4 border-b dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.resetProducts}</h3>
                        </header>
                        <main className="p-4">
                            <p className="text-gray-700 dark:text-gray-300">{t.resetProductsConfirm}</p>
                        </main>
                        <footer className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setResetConfirmOpen(false)}
                                className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 py-2 px-4 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                                {t.close}
                            </button>
                            <button
                                type="button"
                                onClick={handleResetProducts}
                                className="bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700"
                            >
                                {t.resetProducts}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;