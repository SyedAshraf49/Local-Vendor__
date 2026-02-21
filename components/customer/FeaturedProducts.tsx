import React, { useMemo } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import ProductCard from './ProductCard';
import { useProducts } from '../../context/ProductContext';

const FeaturedProducts: React.FC = () => {
    const t = useTranslations();
    const { products } = useProducts();

    const featured = useMemo(() => {
        return products.filter(p => p.offer && new Date(p.expiryDate) >= new Date());
    }, [products]);

    if (featured.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.todaysDeals}</h3>
            <style>{`.featured-deals-scroll::-webkit-scrollbar{display:none;height:0;width:0;}`}</style>
            <div
                className="featured-deals-scroll grid grid-flow-col auto-cols-[minmax(16rem,20rem)] sm:auto-cols-[18rem] gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
                style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
                {featured.map((product, index) => (
                    <div key={product.id} className="snap-start h-full">
                         <ProductCard product={product} index={index} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedProducts;