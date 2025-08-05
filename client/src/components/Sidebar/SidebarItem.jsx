import React, { useState } from 'react'

function SidebarItem({ icon, text, hoverIcon, primary = false, isActive = false }) {
    const [img, setImg] = useState(icon);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            id={text} 
            className={`sidebarItem ${primary ? 'primary' : ''} ${isHovered ? 'hovered' : ''} ${isActive ? 'active' : ''}`} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="sidebarItem__icon">
                <img
                    src={img}
                    alt={text}
                    onMouseOver={() => (setImg(hoverIcon))}
                    onMouseOut={() => (setImg(icon))}
                />
            </div>
            <p className="sidebarItem__text">{text}</p>
            {primary && <div className="sidebarItem__badge">New</div>}
        </div>
    )
}

export default SidebarItem