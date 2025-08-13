import { toast } from 'react-hot-toast';
import { SuccessIcon, ErrorIcon } from './ToastIcons.jsx'; // Importa los iconos personalizados

const useNotify = () => {
    const notify = (message = 'Here is your toast.', type = 'success') => {
        const baseStyle = {
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            boxShadow:
                '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
            color: '#333',
            fontSize: '1.2rem',
            fontFamily: '"Raleway", sans-serif',
            display: "flex",
            gap: "1rem"
        };

        const options = {
            success: { icon: <SuccessIcon />, style: { ...baseStyle, border: '1px solid #4caf50' } },
            error: { icon: <ErrorIcon />, style: { ...baseStyle, border: '1px solid #f44336' } },
            info: { icon: 'ℹ️', style: { ...baseStyle, border: '1px solid #2196f3' } },
        };

        toast(message, options[type] || { style: baseStyle });
    };

    return notify;
};

export default useNotify;