// DOM элементы
const canvas = document.getElementById('pattern-canvas');
const exportBtn = document.getElementById('export-btn');
const exportContainer = document.getElementById('export-container');
const exportCode = document.getElementById('export-code');
const copyBtn = document.getElementById('copy-btn');

// Массив для хранения созданных фигур
let shapes = [];

// Массив доступных фигур
const shapeIds = ['shape-0', 'shape-I', 'shape-J', 'shape-O', 'shape-U'];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Генерируем паттерн при загрузке страницы
    generatePattern();
    
    // Обработчики событий
    exportBtn.addEventListener('click', exportSVG);
    copyBtn.addEventListener('click', copyToClipboard);
});

// Генерация паттерна с 5 фигурами
function generatePattern() {
    // Очищаем холст перед генерацией
    clearCanvas();
    
    // Генерируем 5 фигур
    for (let i = 0; i < 5; i++) {
        // Создаем фигуру со случайными параметрами
        const shape = createRandomShape();
        shapes.push(shape);
        
        // Добавляем фигуру на холст
        canvas.appendChild(shape);
    }
}

// Создание случайной фигуры
function createRandomShape() {
    // Создаем элемент использования символа
    const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    
    // Выбираем случайную фигуру из доступных
    const randomIndex = Math.floor(Math.random() * shapeIds.length);
    const shapeId = shapeIds[randomIndex];
    
    // Устанавливаем ссылку на определение символа
    useElement.setAttribute('href', `#${shapeId}`);
    
    // Генерируем случайное положение
    const x = Math.floor(Math.random() * 400);
    const y = Math.floor(Math.random() * 400);
    
    // Определяем случайный размер (от 40 до 100px)
    const size = Math.floor(Math.random() * 60) + 40;
    
    // Устанавливаем положение и размер
    useElement.setAttribute('x', x);
    useElement.setAttribute('y', y);
    useElement.setAttribute('width', size);
    useElement.setAttribute('height', size);
    
    // Генерируем случайный поворот
    const rotation = Math.floor(Math.random() * 360);
    useElement.setAttribute('transform', `rotate(${rotation} ${x + size/2} ${y + size/2})`);
    
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
