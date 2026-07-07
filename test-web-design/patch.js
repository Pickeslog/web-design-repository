const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '02-main', 'js', 'utils.js');
const code = `\nwindow.clovToast = function(msg, type) {
    let container = document.getElementById('clov-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'clov-toast-container';
        container.style.position = 'fixed';
        container.style.bottom = '40px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = '999999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.background = type === 'success' ? 'var(--primary-green, #1b4332)' : (type === 'info' ? 'var(--gray-900, #111827)' : '#333');
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '30px';
    toast.style.fontSize = '14px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.textContent = msg;
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};
`;
fs.appendFileSync(file, code, 'utf8');
console.log("Successfully appended clovToast to utils.js");
