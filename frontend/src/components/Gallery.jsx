import React, { useState, useEffect } from "react";
import "../static/css/Gallery.css";

function Gallery() {
    // Estado para almacenar el índice de la imagen activa
    const [activeImgIndex, setActiveImgIndex] = useState(0);

    // Array de URLs de las imágenes de la galería
    const galleryImgs = [
        "https://cflvdg.avoz.es/sc/AjKozSPoeEw9CTs1K7cz4a2qkmk=/x/2023/03/12/00121678655761937444346/Foto/i12m3047.jpg",
        "https://cflvdg.avoz.es/sc/_pSMniX4IAq7qilbJ7lDqQiEshY=/1280x/2021/10/20/00121634764802360565458/Foto/GO21P43F1_231932.jpg",
        "https://www.elidealgallego.com/images/showid2/5513385?w=900",
        "https://www.dxtcampeon.com/images/showid2/5614054?w=900",
    ];

    useEffect(() => {
        // Configurar un intervalo para cambiar la imagen activa cada 5 segundos
        const interval = setInterval(() => {
            const nextImgIndex =
                activeImgIndex + 1 < galleryImgs.length ? activeImgIndex + 1 : 0;
            setActiveImgIndex(nextImgIndex);
        }, 5000);

        // Limpiar el intervalo cuando el componente se desmonta o cuando el índice de imagen activa cambia
        return () => clearInterval(interval);
    }, [activeImgIndex, galleryImgs.length]);

    return (
        <div className="gallery">
            {galleryImgs.map((img, index) => (
                <img
                    key={index}
                    src={img}
                    alt={`Imagen ${index + 1}`}
                    className={index === activeImgIndex ? "active" : ""}
                />
            ))}
        </div>
    );
}

export default Gallery;
