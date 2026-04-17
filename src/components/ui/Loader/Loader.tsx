import { useEffect } from 'react';

const Loader = () => {
    useEffect(() => {
        const initLoader = async () => {
            const { lineSpinner } = await import('ldrs');
            lineSpinner.register();
        };
        initLoader();
    }, []);

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <l-line-spinner
                size="42"
                stroke="3"
                speed="1"
                color="white"
            ></l-line-spinner>
        </div>
    );
};

export default Loader;
