    // Генерируем случайный цвет
    const color = getRandomColor();
    useElement.setAttribute('fill', color);
    
    return useElement;
}

// Генерация случайного цвета
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

// Очистка холста
function clearCanvas() {
    // Удаляем все фигуры, кроме определений (defs)
    shapes.forEach(shape => {
        if (shape.parentNode === canvas) {
            canvas.removeChild(shape);
        }
    });
    
    // Очищаем массив фигур
    shapes = [];
}

// Экспорт SVG
function exportSVG() {
    // Создаем копию текущего SVG для экспорта
    const svgCopy = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgCopy.setAttribute('viewBox', '0 0 480 480');
    svgCopy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgCopy.setAttribute('width', '480');
    svgCopy.setAttribute('height', '480');
    
    // Копируем определения символов (defs)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const originalDefs = canvas.querySelector('defs');
    defs.innerHTML = originalDefs.innerHTML;
    svgCopy.appendChild(defs);
    
    // Копируем все фигуры
    shapes.forEach(shape => {
        const shapeClone = shape.cloneNode(true);
        svgCopy.appendChild(shapeClone);
    });
    
    // Преобразуем SVG в строку
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgCopy);
    
    // Показываем контейнер экспорта
    exportContainer.style.display = 'flex';
    
    // Устанавливаем код SVG в текстовое поле
    exportCode.value = svgString;
}

// Копирование кода в буфер обмена
function copyToClipboard() {
    // Выделяем текст в поле
    exportCode.select();
    
    // Копируем в буфер обмена
    document.execCommand('copy');
}
