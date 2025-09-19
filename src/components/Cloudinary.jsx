import React, { useEffect, useState } from 'react';
import './css/Cloudinary.css';

const Cloudinary = ({ 
  onUploadComplete, 
  reset, 
  disabled, 
  buttonText = "Subir Imagen",
  existingImage = null,
  showPreview = true,
  onRemoveImage
}) => {
    const preset_name = import.meta.env.VITE_CLOUDINARY_PRESET;
    const cloud_name = import.meta.env.VITE_CLOUDINARY_NAME;
    
    const [image, setImage] = useState(existingImage || '');
    const [loading, setLoading] = useState(false);
    const [showUploadButton, setShowUploadButton] = useState(!existingImage);

    // Función para eliminar imagen de Cloudinary (llamando a tu backend)
    const deleteImageFromCloudinary = async (imageUrl) => {
        if (!imageUrl) return;
        
        try {
            // Extraer public_id de la URL
            const urlParts = imageUrl.split('/');
            const publicIdWithExtension = urlParts.slice(-2).join('/');
            const publicId = publicIdWithExtension.split('.')[0];
            
            // Llamar a tu endpoint del backend para eliminar la imagen
            const response = await fetch('http://localhost:4000/api/cloudinary/delete-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    publicId: publicId,
                    cloudName: cloud_name
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
            // Aún así procedemos a eliminar la imagen del estado
            return { success: false, error: error.message };
        }
    };

    const uploadImage = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', preset_name);

        setLoading(true);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
                method: 'POST',
                body: data,
            });

            const file = await response.json();
            setImage(file.secure_url);
            setLoading(false);
            setShowUploadButton(false);
            onUploadComplete(file.secure_url);
        } catch (error) {
            console.error('Error uploading image:', error);
            setLoading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (image) {
            // Intentar eliminar de Cloudinary
            const deleteResult = await deleteImageFromCloudinary(image);
            
            if (!deleteResult.success) {
                console.warn('No se pudo eliminar la imagen de Cloudinary, pero se eliminó localmente');
            }
        }
        
        setImage('');
        setShowUploadButton(true);
        onUploadComplete('');
        
        // Llamar a la función onRemoveImage si está definida
        if (onRemoveImage) {
            onRemoveImage(image);
        }
    };

    useEffect(() => {
        if (reset) {
            setImage('');
            setShowUploadButton(true);
        }
    }, [reset]);

    useEffect(() => {
        // Si se pasa una imagen existente, actualizar el estado
        if (existingImage) {
            setImage(existingImage);
            setShowUploadButton(false);
        } else {
            setImage('');
            setShowUploadButton(true);
        }
    }, [existingImage]);

    const getFileIcon = (url) => {
        if (!url) return '📎';
        const extension = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return '🖼️';
        if (['pdf'].includes(extension)) return '📄';
        if (['doc', 'docx'].includes(extension)) return '📝';
        if (['xls', 'xlsx'].includes(extension)) return '📊';
        return '📎';
    };

    const getFileName = (url) => {
        if (!url) return '';
        const parts = url.split('/');
        const fileNameWithExtension = parts[parts.length - 1];
        return fileNameWithExtension.split('.')[0];
    };

    return (
        <div className="cloudinary">
            {showUploadButton && !image && (
                <div className="upload-section">
                    <label htmlFor="file" className="labelFile" style={{ opacity: disabled ? 0.6 : 1 }}>
                        <span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 184.69 184.69"
                                width="40px"
                                height="40px"
                            >
                                <g>
                                    <g>
                                        <path
                                            d="M149.968,50.186c-8.017-14.308-23.796-22.515-40.717-19.813
                                            C102.609,16.43,88.713,7.576,73.087,7.576c-22.117,0-40.112,17.994-40.112,40.115c0,0.913,0.036,1.854,0.118,2.834
                                            C14.004,54.875,0,72.11,0,91.959c0,23.456,19.082,42.535,42.538,42.535h33.623v-7.025H42.538
                                            c-19.583,0-35.509-15.929-35.509-35.509c0-17.526,13.084-32.621,30.442-35.105c0.931-0.132,1.768-0.633,2.326-1.392
                                            c0.555-0.755,0.795-1.704,0.644-2.63c-0.297-1.904-0.447-3.582-0.447-5.139c0-18.249,14.852-33.094,33.094-33.094
                                            c13.703,0,25.789,8.26,30.803,21.04c0.63,1.621,2.351,2.534,4.058,2.14c15.425-3.568,29.919,3.883,36.604,17.168
                                            c0.508,1.027,1.503,1.736,2.641,1.897c17.368,2.473,30.481,17.569,30.481,35.112c0,19.58-15.937,35.509-35.52,35.509H97.391
                                            v7.025h44.761c23.459,0,42.538-19.079,42.538-42.535C184.69,71.545,169.884,53.901,149.968,50.186z"
                                            fill="#010002"
                                        ></path>
                                        <path
                                            d="M108.586,90.201c1.406-1.403,1.406-3.672,0-5.075L88.541,65.078
                                            c-0.701-0.698-1.614-1.045-2.534-1.045l-0.064,0.011c-0.018,0-0.036-0.011-0.054-0.011c-0.931,0-1.850,0.361-2.534,1.045
                                            L63.31,85.127c-1.403,1.403-1.403,3.672,0,5.075c1.403,1.406,3.672,1.406,5.075,0L82.296,76.29v97.227
                                            c0,1.99,1.603,3.597,3.593,3.597c1.979,0,3.59-1.607,3.59-3.597V76.165l14.033,14.036
                                            C104.91,91.608,107.183,91.608,108.586,90.201z"
                                            fill="#010002"
                                        ></path>
                                    </g>
                                </g>
                            </svg>
                        </span>
                        <p>{buttonText}</p>
                    </label>
                    <input
                        id="file"
                        type="file"
                        onChange={uploadImage}
                        className="input"
                        disabled={disabled}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                </div>
            )}

            {loading && (
                <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p>Subiendo...</p>
                </div>
            )}

            {image && !loading && showPreview && (
                <div className="uploaded-preview">
                    <div className="preview-header">
                        <span className="file-icon">{getFileIcon(image)}</span>
                        <span className="file-name">{getFileName(image)}</span>
                    </div>
                    
                    {(image.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null) ? (
                        <img src={image} alt="Uploaded preview" className='uploaded-image' />
                    ) : (
                        <div className="file-preview">
                            <span className="file-type">{getFileIcon(image)}</span>
                            <p>Archivo subido</p>
                        </div>
                    )}
                    
                    <div className="preview-actions">
                        <a 
                            href={image} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="view-button-cloudinary"
                        >
                            Ver
                        </a>
                        <button 
                            onClick={handleRemoveImage} 
                            className="remove-button"
                            disabled={disabled}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            )}

            {image && !loading && !showPreview && (
                <div className="minimal-preview">
                    <span className="minimal-icon">{getFileIcon(image)}</span>
                    <span className="minimal-text">Archivo adjuntado</span>
                    <button 
                        onClick={handleRemoveImage} 
                        className="remove-button-small"
                        disabled={disabled}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cloudinary;