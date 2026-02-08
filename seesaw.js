const voiceEffect= new Audio('drop.mp3');

const DOM = {
    plank: document.getElementById('plank'),
    container: document.getElementById('objects'),
    leftWeight: document.getElementById('left-weight'),
    rightWeight: document.getElementById('right-weight'),
    angle: document.getElementById('angle'),
}

const CONFIG = {
    MAXANGLE: 30,
    DIVISOR: 300, 
}

let state = {
    box: []
};

window.onload = () => {
    const saved = localStorage.getItem('seesaw_data');
    if (saved) {
        state.box = JSON.parse(saved);
        applyTorque(); 
    }
};

DOM.plank.addEventListener('click', (e) => {
    const rect = DOM.plank.getBoundingClientRect();
    const pointx = e.clientX - rect.left;
    const center = rect.width / 2;
    const distance = pointx - center;

    const weight = Math.floor(Math.random() * 10) + 1;
    const addedBox = {
        weight: weight,
        distance: distance,
        x: pointx,
        id: Date.now()
    };
    
    state.box.push(addedBox);
    applyTorque();
    saveState();
});

function applyTorque() {
    let leftTorque = 0;
    let rightTorque = 0;
    let leftWeight = 0;
    let rightWeight = 0;

    state.box.forEach(box => {
        if (box.distance < 0) {
            leftTorque += box.weight * Math.abs(box.distance);
            leftWeight += box.weight;
        } else {
            rightTorque += box.weight * box.distance;
            rightWeight += box.weight;
        }
    });

    let newAngle = (rightTorque - leftTorque) / CONFIG.DIVISOR;
    let maxAngle = Math.max(-CONFIG.MAXANGLE, Math.min(CONFIG.MAXANGLE, newAngle));

    const netTorque = Math.abs(rightTorque - leftTorque);
    const speed = Math.max(0.2, 1.2 - (netTorque / 1000));
    
    DOM.plank.style.transition = `transform ${speed}s cubic-bezier(0.17, 0.67, 0.83, 0.67)`;

    if (DOM.leftWeight) DOM.leftWeight.textContent = `${leftWeight}kg`;
    if (DOM.rightWeight) DOM.rightWeight.textContent = `${rightWeight}kg`;
    if (DOM.angle) DOM.angle.textContent = `${Math.round(maxAngle)}`;
    
    DOM.plank.style.transform = `rotate(${maxAngle}deg)`;

    drawBoxes();
}

function drawBoxes() {
    DOM.container.innerHTML = "";
    
    state.box.forEach(item => {
        const boxStyle = document.createElement('div');
        
        let colorClass = 'box-red';
        if (item.weight <= 2) colorClass = 'box-yellow';
        else if (item.weight <= 4) colorClass = 'box-blue';
        else if (item.weight <= 6) colorClass = 'box-green';
        
        boxStyle.className = `box ${colorClass}`;
        
        const size = 30 + (item.weight * 7);
        boxStyle.style.width = `${size}px`;
        boxStyle.style.height = `${size}px`;
        boxStyle.style.left = `${item.x}px`;
        boxStyle.textContent = `${item.weight}kg`;

        if (Date.now() - item.id < 100) {
            boxStyle.style.animation = "boxFall 0.5s ease-in forwards";
            boxStyle.addEventListener('animationstart', () => {
                voiceEffect.currentTime= 0;
                voiceEffect.play();
            })
        } else {
            boxStyle.style.animation = "none";
            boxStyle.style.opacity = "1";
        }

        DOM.container.appendChild(boxStyle);
    });
}

function saveState() {
    localStorage.setItem('seesaw_data', JSON.stringify(state.box));
}
const resetBtn= document.getElementById('reset-btn');
resetBtn.addEventListener('click', () => {
    state.box = [];
    localStorage.removeItem('seesaw_data');
    DOM.container.innerHTML = "";
    applyTorque(true);
});
