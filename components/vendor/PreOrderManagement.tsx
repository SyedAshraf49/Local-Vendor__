import React, { useEffect, useMemo, useRef } from 'react';
import { usePreOrder } from '../../context/PreOrderContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslations } from '../../hooks/useTranslations';
import { BookOpenIcon } from '../common/Icons';

const PreOrderManagement: React.FC = () => {
    const { preOrderItems, updatePreOrderStatus } = usePreOrder();
    const { user } = useAuth();
    const { addToast } = useToast();
    const t = useTranslations();
    const previousPendingCountRef = useRef(0);

    const vendorPreOrders = useMemo(() => {
        if (!user?.location) {
            return [];
        }
        return preOrderItems
            .filter(item => item.vendorLocation === user.location)
            .sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return b.id - a.id;
            });
    }, [preOrderItems, user?.location]);

    useEffect(() => {
        const pendingCount = vendorPreOrders.filter(item => item.status === 'pending').length;
        if (pendingCount > previousPendingCountRef.current) {
            addToast(t.newPreOrderRequest, 'success');
        }
        previousPendingCountRef.current = pendingCount;
    }, [vendorPreOrders, addToast, t.newPreOrderRequest]);

    const handleAccept = (preOrderId: number) => {
        updatePreOrderStatus(preOrderId, 'accepted');
        addToast(t.preOrderAccepted, 'success');
    };

    const handleReject = (preOrderId: number) => {
        updatePreOrderStatus(preOrderId, 'rejected');
        addToast(t.preOrderRejected, 'success');
    };

    const statusClassMap: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
        accepted: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{t.vendorPreOrders}</h3>
                <BookOpenIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="overflow-x-auto max-h-[32rem] overflow-y-auto">
                {vendorPreOrders.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t.product}</th>
                                <th scope="col" className="px-6 py-3">{t.customer}</th>
                                <th scope="col" className="px-6 py-3">{t.status}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendorPreOrders.map((item) => (
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.productName}</th>
                                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{item.customerName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusClassMap[item.status]}`}>
                                            {t[item.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAccept(item.id)}
                                                disabled={item.status !== 'pending'}
                                                className="bg-green-600 text-white py-1.5 px-3 rounded-md font-semibold text-xs hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {t.provideItem}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleReject(item.id)}
                                                disabled={item.status !== 'pending'}
                                                className="bg-red-600 text-white py-1.5 px-3 rounded-md font-semibold text-xs hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {t.rejectItem}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t.emptyPreOrderList}</p>
                )}
            </div>
        </div>
    );
};

export default PreOrderManagement;